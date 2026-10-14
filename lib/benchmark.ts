import { Point, GridDimensions, AlgorithmType } from "./types";
import { findPathAStar } from "./algorithms/astar";
import { findPathGreedy } from "./algorithms/greedy";
import { findPathBFS } from "./algorithms/bfs";
import { optimizePickOrder, calculateTourEnergy } from "./algorithms/simulatedAnnealing";
import { manhattanDistance } from "./heuristics";

export interface AlgorithmBenchmarkRow {
  id: string;
  name: string;
  type: "Informed" | "Uninformed";
  heuristic: string;
  nodesExpanded: number;
  pathLength: number;
  executionTimeMs: number;
  isOptimal: boolean;
  success: boolean;
}

export interface AnnealingBenchmarkSummary {
  initialDistance: number;
  optimizedDistance: number;
  cellsSaved: number;
  percentSaved: number;
  iterations: number;
  executionTimeMs: number;
}

export interface FullBenchmarkReport {
  pathfindingResults: AlgorithmBenchmarkRow[];
  annealingSummary: AnnealingBenchmarkSummary | null;
}

export function runComprehensiveBenchmark(
  start: Point,
  goal: Point,
  pickups: Point[],
  dropoff: Point,
  dimensions: GridDimensions,
  shelves: Set<string>
): FullBenchmarkReport {
  const targetGoal = pickups.length > 0 ? pickups[0] : goal;

  const astarManhattan = findPathAStar(start, targetGoal, dimensions, shelves, "manhattan");
  const astarEuclidean = findPathAStar(start, targetGoal, dimensions, shelves, "euclidean");
  const greedyManhattan = findPathGreedy(start, targetGoal, dimensions, shelves, "manhattan");
  const bfs = findPathBFS(start, targetGoal, dimensions, shelves);

  const optimalLength = astarManhattan.success ? astarManhattan.pathLength : 0;

  const pathfindingResults: AlgorithmBenchmarkRow[] = [
    {
      id: "astar-manhattan",
      name: "A* Search",
      type: "Informed",
      heuristic: "Manhattan (L1)",
      nodesExpanded: astarManhattan.nodesExpanded,
      pathLength: astarManhattan.pathLength,
      executionTimeMs: Math.round(astarManhattan.executionTimeMs * 100) / 100,
      isOptimal: astarManhattan.success,
      success: astarManhattan.success,
    },
    {
      id: "astar-euclidean",
      name: "A* Search",
      type: "Informed",
      heuristic: "Euclidean (L2)",
      nodesExpanded: astarEuclidean.nodesExpanded,
      pathLength: astarEuclidean.pathLength,
      executionTimeMs: Math.round(astarEuclidean.executionTimeMs * 100) / 100,
      isOptimal: astarEuclidean.success,
      success: astarEuclidean.success,
    },
    {
      id: "greedy-manhattan",
      name: "Greedy Best-First",
      type: "Informed",
      heuristic: "Manhattan (L1)",
      nodesExpanded: greedyManhattan.nodesExpanded,
      pathLength: greedyManhattan.pathLength,
      executionTimeMs: Math.round(greedyManhattan.executionTimeMs * 100) / 100,
      isOptimal: greedyManhattan.success && greedyManhattan.pathLength === optimalLength,
      success: greedyManhattan.success,
    },
    {
      id: "bfs",
      name: "Breadth-First (BFS)",
      type: "Uninformed",
      heuristic: "None (Unit Cost)",
      nodesExpanded: bfs.nodesExpanded,
      pathLength: bfs.pathLength,
      executionTimeMs: Math.round(bfs.executionTimeMs * 100) / 100,
      isOptimal: bfs.success,
      success: bfs.success,
    },
  ];

  let annealingSummary: AnnealingBenchmarkSummary | null = null;
  if (pickups.length > 1) {
    const saResult = optimizePickOrder(start, pickups, dropoff, manhattanDistance);
    const initialDist = saResult.initialEnergy;
    const optimizedDist = saResult.finalEnergy;
    const saved = Math.max(0, initialDist - optimizedDist);
    const percent = initialDist > 0 ? Math.round((saved / initialDist) * 100) : 0;

    annealingSummary = {
      initialDistance: initialDist,
      optimizedDistance: optimizedDist,
      cellsSaved: saved,
      percentSaved: percent,
      iterations: saResult.iterations,
      executionTimeMs: Math.round(saResult.executionTimeMs * 100) / 100,
    };
  }

  return {
    pathfindingResults,
    annealingSummary,
  };
}
