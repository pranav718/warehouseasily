import { Point, GridDimensions, SearchNode, SearchStep, SearchResult } from "../types";

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

export function* findPathBFSGenerator(
  start: Point,
  goal: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>
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

  const queue: SearchNode[] = [];
  const visited = new Set<string>();
  const visitedOrder: Point[] = [];

  const startNode: SearchNode = {
    point: start,
    g: 0,
    h: 0,
    f: 0,
    parent: null,
  };

  queue.push(startNode);
  visited.add(startKey);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentKey = pointKey(current.point);
    visitedOrder.push(current.point);

    const openPoints = queue.map((n) => n.point);
    const closedPoints = Array.from(visited).map((k) => {
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
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        const neighborNode: SearchNode = {
          point: neighbor,
          g: current.g + 1,
          h: 0,
          f: current.g + 1,
          parent: current,
        };
        queue.push(neighborNode);
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

export function findPathBFS(
  start: Point,
  goal: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>
): SearchResult {
  const generator = findPathBFSGenerator(start, goal, dimensions, blockedSet);
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value;
}
