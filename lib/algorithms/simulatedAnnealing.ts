import { Point, AnnealingConfig, AnnealingStep, AnnealingResult } from "../types";
import { manhattanDistance } from "../heuristics";

export const DEFAULT_ANNEALING_CONFIG: AnnealingConfig = {
  initialTemp: 1000,
  coolingRate: 0.995,
  minTemp: 0.05,
  maxIterations: 2500,
};

export function calculateTourEnergy(
  start: Point,
  pickups: Point[],
  dropoff: Point,
  distanceFn: (a: Point, b: Point) => number
): number {
  if (pickups.length === 0) {
    return distanceFn(start, dropoff);
  }

  let total = distanceFn(start, pickups[0]);
  for (let i = 0; i < pickups.length - 1; i++) {
    total += distanceFn(pickups[i], pickups[i + 1]);
  }
  total += distanceFn(pickups[pickups.length - 1], dropoff);
  return total;
}

function mutateTwoOpt(route: Point[]): Point[] {
  if (route.length < 2) return [...route];
  const next = [...route];
  const i = Math.floor(Math.random() * next.length);
  let j = Math.floor(Math.random() * next.length);
  while (j === i) {
    j = Math.floor(Math.random() * next.length);
  }
  const startIdx = Math.min(i, j);
  const endIdx = Math.max(i, j);

  const reversedSegment = next.slice(startIdx, endIdx + 1).reverse();
  next.splice(startIdx, reversedSegment.length, ...reversedSegment);
  return next;
}

function mutateSwap(route: Point[]): Point[] {
  if (route.length < 2) return [...route];
  const next = [...route];
  const i = Math.floor(Math.random() * next.length);
  let j = Math.floor(Math.random() * next.length);
  while (j === i) {
    j = Math.floor(Math.random() * next.length);
  }
  const temp = next[i];
  next[i] = next[j];
  next[j] = temp;
  return next;
}

export function* optimizePickOrderGenerator(
  start: Point,
  pickups: Point[],
  dropoff: Point,
  distanceFn: (a: Point, b: Point) => number = manhattanDistance,
  config: Partial<AnnealingConfig> = {}
): Generator<AnnealingStep, AnnealingResult, unknown> {
  const startTime = performance.now();
  const fullConfig: AnnealingConfig = {
    ...DEFAULT_ANNEALING_CONFIG,
    ...config,
  };

  if (pickups.length <= 1) {
    const energy = calculateTourEnergy(start, pickups, dropoff, distanceFn);
    return {
      optimizedOrder: [...pickups],
      initialEnergy: energy,
      finalEnergy: energy,
      energyHistory: [{ iteration: 0, temperature: fullConfig.initialTemp, energy }],
      iterations: 1,
      executionTimeMs: performance.now() - startTime,
    };
  }

  let currentRoute = [...pickups];
  let currentEnergy = calculateTourEnergy(start, currentRoute, dropoff, distanceFn);

  let bestRoute = [...currentRoute];
  let bestEnergy = currentEnergy;

  const initialEnergy = currentEnergy;
  let temperature = fullConfig.initialTemp;
  const energyHistory: { iteration: number; temperature: number; energy: number }[] = [];

  let iteration = 0;

  while (
    temperature > fullConfig.minTemp &&
    iteration < fullConfig.maxIterations
  ) {
    iteration++;

    const candidateRoute =
      Math.random() > 0.4 ? mutateTwoOpt(currentRoute) : mutateSwap(currentRoute);

    const candidateEnergy = calculateTourEnergy(
      start,
      candidateRoute,
      dropoff,
      distanceFn
    );

    const deltaEnergy = candidateEnergy - currentEnergy;
    let accepted = false;

    if (deltaEnergy < 0) {
      currentRoute = candidateRoute;
      currentEnergy = candidateEnergy;
      accepted = true;

      if (currentEnergy < bestEnergy) {
        bestEnergy = currentEnergy;
        bestRoute = [...currentRoute];
      }
    } else {
      const acceptanceProbability = Math.exp(-deltaEnergy / temperature);
      if (Math.random() < acceptanceProbability) {
        currentRoute = candidateRoute;
        currentEnergy = candidateEnergy;
        accepted = true;
      }
    }

    if (iteration % 10 === 0 || iteration === 1) {
      energyHistory.push({
        iteration,
        temperature,
        energy: currentEnergy,
      });

      yield {
        iteration,
        temperature,
        currentEnergy,
        bestEnergy,
        accepted,
        currentRoute: [...currentRoute],
      };
    }

    temperature *= fullConfig.coolingRate;
  }

  energyHistory.push({
    iteration,
    temperature,
    energy: bestEnergy,
  });

  const executionTimeMs = performance.now() - startTime;

  return {
    optimizedOrder: bestRoute,
    initialEnergy,
    finalEnergy: bestEnergy,
    energyHistory,
    iterations: iteration,
    executionTimeMs,
  };
}

export function optimizePickOrder(
  start: Point,
  pickups: Point[],
  dropoff: Point,
  distanceFn: (a: Point, b: Point) => number = manhattanDistance,
  config: Partial<AnnealingConfig> = {}
): AnnealingResult {
  const generator = optimizePickOrderGenerator(
    start,
    pickups,
    dropoff,
    distanceFn,
    config
  );
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value;
}
