export type CellType =
  | "empty"
  | "shelf"
  | "obstacle"
  | "pickup"
  | "dropoff"
  | "robot";

export interface Point {
  x: number;
  y: number;
}

export interface GridDimensions {
  rows: number;
  cols: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  id: string;
}

export type AlgorithmType = "astar" | "greedy" | "bfs";

export type HeuristicType = "manhattan" | "euclidean" | "chebyshev";

export interface SearchNode {
  point: Point;
  g: number;
  h: number;
  f: number;
  parent: SearchNode | null;
}

export interface SearchStep {
  current: Point;
  openSet: Point[];
  closedSet: Point[];
  visitedCount: number;
}

export interface SearchResult {
  path: Point[];
  visitedOrder: Point[];
  nodesExpanded: number;
  executionTimeMs: number;
  pathLength: number;
  pathCost: number;
  success: boolean;
}

export interface AnnealingConfig {
  initialTemp: number;
  coolingRate: number;
  minTemp: number;
  maxIterations: number;
}

export interface AnnealingStep {
  iteration: number;
  temperature: number;
  currentEnergy: number;
  bestEnergy: number;
  accepted: boolean;
  currentRoute: Point[];
}

export interface AnnealingResult {
  optimizedOrder: Point[];
  initialEnergy: number;
  finalEnergy: number;
  energyHistory: { iteration: number; temperature: number; energy: number }[];
  iterations: number;
  executionTimeMs: number;
}

export interface MultiStopOrder {
  id: string;
  start: Point;
  pickups: Point[];
  dropoff: Point;
}

export interface DispatchedRoute {
  order: MultiStopOrder;
  stopSequence: Point[];
  completePath: Point[];
  segmentResults: SearchResult[];
  totalDistance: number;
  totalNodesExpanded: number;
  executionTimeMs: number;
}
