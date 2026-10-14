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

export function* findPathGreedyGenerator(
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

  const openQueue = new PriorityQueue<SearchNode>((a, b) => a.h - b.h);
  const closedSet = new Set<string>();
  const visitedOrder: Point[] = [];
  const inOpen = new Set<string>();

  const initialH = calculateHeuristic(heuristic, start, goal);
  const startNode: SearchNode = {
    point: start,
    g: 0,
    h: initialH,
    f: initialH,
    parent: null,
  };

  openQueue.push(startNode);
  inOpen.add(startKey);

  while (!openQueue.isEmpty()) {
    const current = openQueue.pop()!;
    const currentKey = pointKey(current.point);
    inOpen.delete(currentKey);

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
      if (closedSet.has(neighborKey) || inOpen.has(neighborKey)) {
        continue;
      }

      const h = calculateHeuristic(heuristic, neighbor, goal);
      const neighborNode: SearchNode = {
        point: neighbor,
        g: current.g + 1,
        h,
        f: h,
        parent: current,
      };

      openQueue.push(neighborNode);
      inOpen.add(neighborKey);
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

export function findPathGreedy(
  start: Point,
  goal: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>,
  heuristic: HeuristicType = "manhattan"
): SearchResult {
  const generator = findPathGreedyGenerator(
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
