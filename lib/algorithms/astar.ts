import { Point, GridDimensions, HeuristicType, SearchNode, SearchStep, SearchResult } from "../types";
import { PriorityQueue } from "../priorityQueue";
import { calculateHeuristic } from "../heuristics";

function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

function getNeighbors(
  p: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>
): Point[] {
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  const neighbors: Point[] = [];
  for (const d of directions) {
    const nx = p.x + d.x;
    const ny = p.y + d.y;
    if (nx >= 0 && nx < dimensions.cols && ny >= 0 && ny < dimensions.rows) {
      const key = `${nx},${ny}`;
      if (!blockedSet.has(key)) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
}

function reconstructPath(node: SearchNode): Point[] {
  const path: Point[] = [];
  let current: SearchNode | null = node;
  while (current !== null) {
    path.push(current.point);
    current = current.parent;
  }
  return path.reverse();
}

export function* findPathAStarGenerator(
  start: Point,
  goal: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>,
  heuristic: HeuristicType = "manhattan"
): Generator<SearchStep, SearchResult, unknown> {
  const startTime = performance.now();
  const startKey = pointKey(start);
  const goalKey = pointKey(goal);

  if (startKey === goalKey) {
    return {
      path: [start],
      visitedOrder: [start],
      nodesExpanded: 1,
      executionTimeMs: 0,
      pathLength: 1,
      pathCost: 0,
      success: true,
    };
  }

  const openQueue = new PriorityQueue<SearchNode>((a, b) => {
    if (a.f !== b.f) return a.f - b.f;
    return a.h - b.h;
  });

  const allNodes = new Map<string, SearchNode>();
  const closedSet = new Set<string>();
  const visitedOrder: Point[] = [];

  const initialH = calculateHeuristic(heuristic, start, goal);
  const startNode: SearchNode = {
    point: start,
    g: 0,
    h: initialH,
    f: initialH,
    parent: null,
  };

  openQueue.push(startNode);
  allNodes.set(startKey, startNode);

  while (!openQueue.isEmpty()) {
    const current = openQueue.pop()!;
    const currentKey = pointKey(current.point);

    if (closedSet.has(currentKey)) {
      continue;
    }

    closedSet.add(currentKey);
    visitedOrder.push(current.point);

    const openPoints = openQueue.toArray().map((n) => n.point);
    const closedPoints = Array.from(closedSet).map((k) => {
      const [x, y] = k.split(",").map(Number);
      return { x, y };
    });

    yield {
      current: current.point,
      openSet: openPoints,
      closedSet: closedPoints,
      visitedCount: visitedOrder.length,
    };

    if (currentKey === goalKey) {
      const path = reconstructPath(current);
      const executionTimeMs = performance.now() - startTime;
      return {
        path,
        visitedOrder,
        nodesExpanded: visitedOrder.length,
        executionTimeMs,
        pathLength: path.length,
        pathCost: current.g,
        success: true,
      };
    }

    const neighbors = getNeighbors(current.point, dimensions, blockedSet);
    for (const neighbor of neighbors) {
      const neighborKey = pointKey(neighbor);
      if (closedSet.has(neighborKey)) {
        continue;
      }

      const tentativeG = current.g + 1;
      const existing = allNodes.get(neighborKey);

      if (!existing || tentativeG < existing.g) {
        const h = calculateHeuristic(heuristic, neighbor, goal);
        const neighborNode: SearchNode = {
          point: neighbor,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: current,
        };

        allNodes.set(neighborKey, neighborNode);
        openQueue.push(neighborNode);
      }
    }
  }

  const executionTimeMs = performance.now() - startTime;
  return {
    path: [],
    visitedOrder,
    nodesExpanded: visitedOrder.length,
    executionTimeMs,
    pathLength: 0,
    pathCost: 0,
    success: false,
  };
}

export function findPathAStar(
  start: Point,
  goal: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>,
  heuristic: HeuristicType = "manhattan"
): SearchResult {
  const generator = findPathAStarGenerator(
    start,
    goal,
    dimensions,
    blockedSet,
    heuristic
  );
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value;
}
