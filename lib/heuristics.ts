import { Point, HeuristicType } from "./types";

export function manhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function euclideanDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function chebyshevDistance(a: Point, b: Point): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function calculateHeuristic(
  type: HeuristicType,
  a: Point,
  b: Point
): number {
  switch (type) {
    case "manhattan":
      return manhattanDistance(a, b);
    case "euclidean":
      return euclideanDistance(a, b);
    case "chebyshev":
      return chebyshevDistance(a, b);
    default:
      return manhattanDistance(a, b);
  }
}
