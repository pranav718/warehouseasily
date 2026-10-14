import {
  Point,
  GridDimensions,
  AlgorithmType,
  HeuristicType,
  MultiStopOrder,
  DispatchedRoute,
  SearchResult,
} from "./types";
import { findPathAStar, findPathAStarGenerator } from "./algorithms/astar";
import { findPathGreedy } from "./algorithms/greedy";
import { findPathBFS } from "./algorithms/bfs";
import { optimizePickOrder } from "./algorithms/simulatedAnnealing";
import { manhattanDistance } from "./heuristics";

export interface CoordinatorOptions {
  algorithm?: AlgorithmType;
  heuristic?: HeuristicType;
  useAnnealing?: boolean;
}

export function runPathfinding(
  start: Point,
  goal: Point,
  dimensions: GridDimensions,
  blockedSet: Set<string>,
  algorithm: AlgorithmType = "astar",
  heuristic: HeuristicType = "manhattan"
): SearchResult {
  switch (algorithm) {
    case "astar":
      return findPathAStar(start, goal, dimensions, blockedSet, heuristic);
    case "greedy":
      return findPathGreedy(start, goal, dimensions, blockedSet, heuristic);
    case "bfs":
      return findPathBFS(start, goal, dimensions, blockedSet);
    default:
      return findPathAStar(start, goal, dimensions, blockedSet, heuristic);
  }
}

export function dispatchOrder(
  order: MultiStopOrder,
  dimensions: GridDimensions,
  blockedSet: Set<string>,
  options: CoordinatorOptions = {}
): DispatchedRoute {
  const startTime = performance.now();
  const algorithm = options.algorithm ?? "astar";
  const heuristic = options.heuristic ?? "manhattan";
  const useAnnealing = options.useAnnealing ?? true;

  let stopSequence: Point[] = [];

  if (useAnnealing && order.pickups.length > 1) {
    const annealingResult = optimizePickOrder(
      order.start,
      order.pickups,
      order.dropoff,
      manhattanDistance
    );
    stopSequence = [order.start, ...annealingResult.optimizedOrder, order.dropoff];
  } else {
    stopSequence = [order.start, ...order.pickups, order.dropoff];
  }

  const completePath: Point[] = [];
  const segmentResults: SearchResult[] = [];
  let totalDistance = 0;
  let totalNodesExpanded = 0;

  for (let i = 0; i < stopSequence.length - 1; i++) {
    const segStart = stopSequence[i];
    const segGoal = stopSequence[i + 1];

    const result = runPathfinding(
      segStart,
      segGoal,
      dimensions,
      blockedSet,
      algorithm,
      heuristic
    );

    segmentResults.push(result);
    totalNodesExpanded += result.nodesExpanded;

    if (result.success && result.path.length > 0) {
      if (completePath.length === 0) {
        completePath.push(...result.path);
      } else {
        completePath.push(...result.path.slice(1));
      }
      totalDistance += result.pathCost;
    }
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    order,
    stopSequence,
    completePath,
    segmentResults,
    totalDistance,
    totalNodesExpanded,
    executionTimeMs,
  };
}
