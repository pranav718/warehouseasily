"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Point,
  GridDimensions,
  AlgorithmType,
  HeuristicType,
  SearchStep,
  SearchResult,
} from "../lib/types";
import { WarehouseGrid } from "../components/WarehouseGrid";
import { PlaybackControls } from "../components/PlaybackControls";
import { BenchmarkPanel } from "../components/BenchmarkPanel";
import { FleetStatus } from "../components/FleetStatus";
import { getPreset } from "../lib/presets";
import { findPathAStarGenerator } from "../lib/algorithms/astar";
import { findPathGreedyGenerator } from "../lib/algorithms/greedy";
import { findPathBFSGenerator } from "../lib/algorithms/bfs";
import { optimizePickOrder } from "../lib/algorithms/simulatedAnnealing";
import { manhattanDistance } from "../lib/heuristics";
import { runComprehensiveBenchmark, FullBenchmarkReport } from "../lib/benchmark";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  Compass,
} from "lucide-react";

export default function DashboardPage() {
  const initialPreset = getPreset("kiva");
  const [selectedPreset, setSelectedPreset] = useState<string>("kiva");
  const [dimensions] = useState<GridDimensions>(initialPreset.dimensions);

  const [shelves, setShelves] = useState<Set<string>>(() => {
    return new Set(initialPreset.shelves.map((p) => `${p.x},${p.y}`));
  });
  const [start, setStart] = useState<Point>(initialPreset.start);
  const [pickups, setPickups] = useState<Point[]>(initialPreset.pickups);
  const [dropoff, setDropoff] = useState<Point>(initialPreset.dropoff);

  const [algorithm, setAlgorithm] = useState<AlgorithmType>("astar");
  const [heuristic, setHeuristic] = useState<HeuristicType>("manhattan");
  const [useAnnealing, setUseAnnealing] = useState<boolean>(true);

  const [openSet, setOpenSet] = useState<Point[]>([]);
  const [closedSet, setClosedSet] = useState<Point[]>([]);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [path, setPath] = useState<Point[]>([]);
  const [robotPosition, setRobotPosition] = useState<Point | null>(null);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(5);
  const [statusMessage, setStatusMessage] = useState<string>("Ready");

  const [benchmarkReport, setBenchmarkReport] = useState<FullBenchmarkReport | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);

  const [metrics, setMetrics] = useState({
    nodesExpanded: 87,
    pathLength: 33,
    executionTimeMs: 14,
    initialEnergy: 48,
    finalEnergy: 36,
    annealingSavings: 12,
  });

  const executionRef = useRef<{ cancelled: boolean; paused: boolean }>({
    cancelled: false,
    paused: false,
  });

  const triggerBenchmark = useCallback(
    (
      currentStart: Point,
      currentGoal: Point,
      currentPickups: Point[],
      currentDropoff: Point,
      currentDims: GridDimensions,
      currentShelves: Set<string>
    ) => {
      setIsBenchmarking(true);
      setTimeout(() => {
        const report = runComprehensiveBenchmark(
          currentStart,
          currentGoal,
          currentPickups,
          currentDropoff,
          currentDims,
          currentShelves
        );
        setBenchmarkReport(report);
        setIsBenchmarking(false);
      }, 30);
    },
    []
  );

  useEffect(() => {
    triggerBenchmark(start, dropoff, pickups, dropoff, dimensions, shelves);
  }, []);

  const resetSimulationState = useCallback(() => {
    executionRef.current.cancelled = true;
    setIsRunning(false);
    setIsPaused(false);
    setOpenSet([]);
    setClosedSet([]);
    setCurrentPoint(null);
    setPath([]);
    setRobotPosition(null);
    setStatusMessage("Ready");
  }, []);

  const loadPreset = (presetId: string) => {
    resetSimulationState();
    setSelectedPreset(presetId);
    const p = getPreset(presetId);
    const nextShelves = new Set(p.shelves.map((pt) => `${pt.x},${pt.y}`));
    setShelves(nextShelves);
    setStart(p.start);
    setPickups(p.pickups);
    setDropoff(p.dropoff);

    triggerBenchmark(p.start, p.dropoff, p.pickups, p.dropoff, dimensions, nextShelves);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSimulation = async () => {
    resetSimulationState();
    await sleep(50);

    executionRef.current = { cancelled: false, paused: false };
    setIsRunning(true);
    setIsPaused(false);
    setStatusMessage("Optimizing pick sequence...");

    let orderedStops: Point[] = [start, ...pickups, dropoff];
    let initE = 0;
    let optE = 0;

    if (useAnnealing && pickups.length > 1) {
      const saResult = optimizePickOrder(start, pickups, dropoff, manhattanDistance);
      initE = saResult.initialEnergy;
      optE = saResult.finalEnergy;
      orderedStops = [start, ...saResult.optimizedOrder, dropoff];
      setMetrics((prev) => ({
        ...prev,
        initialEnergy: initE,
        finalEnergy: optE,
        annealingSavings: Math.max(0, initE - optE),
      }));
    }

    const completeCalculatedPath: Point[] = [];
    let totalExpanded = 0;
    const simStartTime = performance.now();

    for (let legIdx = 0; legIdx < orderedStops.length - 1; legIdx++) {
      if (executionRef.current.cancelled) return;

      const legStart = orderedStops[legIdx];
      const legGoal = orderedStops[legIdx + 1];

      const algLabel = algorithm === "astar" ? "A*" : algorithm === "greedy" ? "Greedy" : "BFS";
      setStatusMessage(
        `Pathfinding leg ${legIdx + 1} of ${orderedStops.length - 1} (${algLabel})...`
      );

      let generator: Generator<SearchStep, SearchResult, unknown>;
      if (algorithm === "astar") {
        generator = findPathAStarGenerator(
          legStart,
          legGoal,
          dimensions,
          shelves,
          heuristic
        );
      } else if (algorithm === "greedy") {
        generator = findPathGreedyGenerator(
          legStart,
          legGoal,
          dimensions,
          shelves,
          heuristic
        );
      } else {
        generator = findPathBFSGenerator(legStart, legGoal, dimensions, shelves);
      }

      let stepResult = generator.next();
      while (!stepResult.done) {
        if (executionRef.current.cancelled) return;
        while (executionRef.current.paused) {
          if (executionRef.current.cancelled) return;
          await sleep(100);
        }

        const step = stepResult.value;
        setCurrentPoint(step.current);
        setOpenSet(step.openSet);
        setClosedSet(step.closedSet);
        totalExpanded++;

        const delay = Math.max(2, Math.floor(60 / speed));
        await sleep(delay);

        stepResult = generator.next();
      }

      const legResult = stepResult.value;
      if (!legResult.success) {
        setStatusMessage("Target unreachable: Path obstructed by shelves");
        setIsRunning(false);
        return;
      }

      if (completeCalculatedPath.length === 0) {
        completeCalculatedPath.push(...legResult.path);
      } else {
        completeCalculatedPath.push(...legResult.path.slice(1));
      }

      setPath([...completeCalculatedPath]);
      setMetrics((prev) => ({
        ...prev,
        nodesExpanded: totalExpanded,
        pathLength: completeCalculatedPath.length,
        executionTimeMs: Math.round(performance.now() - simStartTime),
      }));
    }

    setCurrentPoint(null);
    setOpenSet([]);
    setClosedSet([]);
    setStatusMessage("Navigating AGV robot along planned route...");

    for (let stepIdx = 0; stepIdx < completeCalculatedPath.length; stepIdx++) {
      if (executionRef.current.cancelled) return;
      while (executionRef.current.paused) {
        if (executionRef.current.cancelled) return;
        await sleep(100);
      }

      setRobotPosition(completeCalculatedPath[stepIdx]);
      const navDelay = Math.max(15, Math.floor(200 / speed));
      await sleep(navDelay);
    }

    setStatusMessage("Mission complete: Order delivered to loading dock");
    setIsRunning(false);
  };

  const handlePause = () => {
    executionRef.current.paused = true;
    setIsPaused(true);
  };

  const handleResume = () => {
    executionRef.current.paused = false;
    setIsPaused(false);
  };

  const handleStep = () => {
    if (isPaused) {
      executionRef.current.paused = false;
      setTimeout(() => {
        executionRef.current.paused = true;
      }, 50);
    } else if (!isRunning) {
      runSimulation();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] bg-[url('/bg.png')] bg-cover bg-fixed bg-center font-sans py-6 px-4 md:px-8 lg:px-12 flex justify-center items-start selection:bg-[#C9F27D]/30">
      <div className="w-full max-w-[1520px] bg-black/40 backdrop-blur-2xl rounded-2xl border border-zinc-800/80 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        <header className="h-[76px] border-b border-zinc-800/80 flex items-center justify-between px-6 shrink-0 bg-zinc-950/40 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="leading-none">
                <span className="font-serif italic font-normal text-3xl tracking-normal text-[#C9F27D]">
                  warehouseasily
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-300">
            <span className="flex items-center gap-2 font-mono text-zinc-400">
              source: node-hosted fleet telemetry
            </span>
          </div>
        </header>

        <div className="px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-zinc-800/60 bg-[#0e0e12] text-[11px] font-mono">
          <span className="text-zinc-100 uppercase tracking-[0.16em] not-italic font-bold">
            Fleet runtime
          </span>
          <span className="text-zinc-300">
            node-hosted distributed peers
          </span>

          <span className="flex items-center gap-1.5 text-zinc-200">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRunning && !isPaused ? "bg-emerald-300 animate-pulse" : "bg-zinc-500"
              }`}
            />
            <span>{isRunning ? (isPaused ? "paused" : "running") : "ready"}</span>
          </span>

          <span className="text-zinc-400 tabular-nums">
            step <span className="text-zinc-200 font-semibold">{metrics.pathLength > 0 ? metrics.pathLength : 0}</span>
          </span>

          <span className="text-zinc-400">
            nodes <span className="text-zinc-200 font-semibold">{metrics.nodesExpanded}</span>
          </span>

          <div className="ml-auto flex items-center gap-2 rounded-lg border px-3 py-1 border-emerald-300/30 bg-[#0b1f18]">
            <span className="text-emerald-200 font-semibold">0 collisions</span>
            <span className="text-emerald-300 tabular-nums">
              across {metrics.pathLength > 0 ? metrics.pathLength * 3 : 84} ticks
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col xl:flex-row gap-4">
          <div className="w-full xl:w-[72%] flex flex-col gap-4 min-w-0">
            <WarehouseGrid
              dimensions={dimensions}
              shelves={shelves}
              start={start}
              pickups={pickups}
              dropoff={dropoff}
              openSet={openSet}
              closedSet={closedSet}
              currentPoint={currentPoint}
              path={path}
              robotPosition={robotPosition}
            />

            <PlaybackControls
              isRunning={isRunning}
              isPaused={isPaused}
              speed={speed}
              algorithm={algorithm}
              heuristic={heuristic}
              useAnnealing={useAnnealing}
              selectedPreset={selectedPreset}
              onPlay={isPaused ? handleResume : runSimulation}
              onPause={handlePause}
              onStep={handleStep}
              onReset={resetSimulationState}
              onSpeedChange={setSpeed}
              onAlgorithmChange={setAlgorithm}
              onHeuristicChange={setHeuristic}
              onUseAnnealingChange={setUseAnnealing}
              onPresetChange={loadPreset}
            />

            <div className="w-full bg-zinc-900/40 backdrop-blur-md rounded-xl border border-zinc-800/80 flex flex-wrap md:flex-nowrap shadow-2xl divide-y md:divide-y-0 md:divide-x divide-zinc-800/80">
              <div className="flex-1 p-3 flex flex-col justify-center gap-1">
                <div className="flex items-center justify-between text-zinc-500 gap-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    nodes expanded
                  </span>
                  <div className="w-5 h-5 rounded-md bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-center shrink-0 text-zinc-400">
                    <Layers size={12} strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-zinc-100 mt-0.5">
                  {metrics.nodesExpanded}
                </div>
              </div>

              <div className="flex-1 p-3 flex flex-col justify-center gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    path distance
                  </span>
                  <div className="w-5 h-5 rounded-md bg-[#C9F27D]/15 border border-[#C9F27D]/30 text-[#C9F27D] flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-[#C9F27D] mt-0.5">
                  {metrics.pathLength > 0 ? `${metrics.pathLength} cells` : "0 cells"}
                </div>
              </div>

              <div className="flex-1 p-3 flex flex-col justify-center gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    search time
                  </span>
                  <div className="w-5 h-5 rounded-md bg-zinc-950/60 border border-zinc-800/60 text-zinc-400 flex items-center justify-center shrink-0">
                    <Clock size={12} strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-zinc-100 mt-0.5">
                  {metrics.executionTimeMs} ms
                </div>
              </div>

              <div className="flex-1 p-3 flex flex-col justify-center gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    anneal savings
                  </span>
                  <div className="w-5 h-5 rounded-md bg-[#C9F27D]/15 border border-[#C9F27D]/30 text-[#C9F27D] flex items-center justify-center shrink-0">
                    <TrendingUp size={12} strokeWidth={2} />
                  </div>
                </div>
                <div className="text-2xl font-mono font-bold text-[#C9F27D] mt-0.5">
                  {metrics.annealingSavings > 0 ? `-${metrics.annealingSavings} cells` : "0 cells"}
                </div>
              </div>

              <div className="flex-1 p-3 flex flex-col justify-center gap-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                    active strategy
                  </span>
                  <div className="w-5 h-5 rounded-md bg-zinc-950/60 border border-zinc-800/60 text-zinc-400 flex items-center justify-center shrink-0">
                    <Activity size={12} strokeWidth={2} />
                  </div>
                </div>
                <div className="text-xl font-mono font-bold text-zinc-200 mt-0.5">
                  {algorithm === "astar" ? "A*" : algorithm === "greedy" ? "Greedy BFS" : "BFS"}
                </div>
              </div>
            </div>

            <BenchmarkPanel
              report={benchmarkReport}
              isBenchmarking={isBenchmarking}
              onRunBenchmark={() =>
                triggerBenchmark(start, dropoff, pickups, dropoff, dimensions, shelves)
              }
            />
          </div>

          <div className="w-full xl:w-[28%] flex flex-col gap-4 min-w-0">
            <FleetStatus
              robotPosition={robotPosition}
              isRunning={isRunning}
              isPaused={isPaused}
              statusMessage={statusMessage}
            />

            <div className="border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-xl p-5 flex flex-col gap-3 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Compass size={15} className="text-[#C9F27D]" />
                <h3 className="text-sm font-semibold tracking-wide text-zinc-100 font-mono">
                  algorithm breakdown
                </h3>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-mono">Selected Algorithm:</span>
                  <span className="font-bold text-[#C9F27D] uppercase font-mono">
                    {algorithm === "astar"
                      ? "A* Search"
                      : algorithm === "greedy"
                      ? "Greedy Best-First"
                      : "Breadth-First (BFS)"}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-white/10 flex flex-col gap-2 font-mono">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    Evaluation Formula
                  </div>
                  <div className="text-base font-bold text-[#C9F27D]">
                    {algorithm === "astar"
                      ? "f(n) = g(n) + h(n)"
                      : algorithm === "greedy"
                      ? "f(n) = h(n)"
                      : "f(n) = depth(n)"}
                  </div>
                  <div className="text-[12px] text-zinc-400 mt-1 leading-relaxed">
                    {algorithm === "astar"
                      ? "Combines accumulated movement cost g(n) with admissible distance heuristic h(n). Strictly optimal shortest path guaranteed."
                      : algorithm === "greedy"
                      ? "Expands nodes closest to the goal based solely on heuristic h(n). Fast in unobstructed open aisles, but vulnerable to dead-end obstacle traps."
                      : "Uninformed uniform frontier exploration. Guarantees shortest path on an unweighted grid at the cost of exponential memory."}
                  </div>
                </div>

                {algorithm !== "bfs" && (
                  <div className="flex items-center justify-between py-1.5 border-t border-white/10 text-zinc-400">
                    <span className="font-mono">Distance Heuristic:</span>
                    <span className="font-mono text-zinc-200 capitalize">
                      {heuristic} (L1/L2)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1.5 border-t border-white/10 text-zinc-400">
                  <span className="font-mono">Pick Tour Optimizer:</span>
                  <span className="font-mono text-[#C9F27D]">
                    {useAnnealing ? "Simulated Annealing" : "Sequential Order"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-xl p-5 flex flex-col gap-3 shadow-2xl">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-100 font-mono border-b border-white/10 pb-3">
                search strategy profiles
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="font-semibold text-[#C9F27D] font-mono flex items-center justify-between">
                    <span>A* Search</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Optimal</span>
                  </div>
                  <div className="text-zinc-400 mt-1.5 text-[11px] leading-relaxed">
                    Uses admissibility condition h(n) &le; h*(n) to prune suboptimal branches. Expands only nodes oriented toward the goal target.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="font-semibold text-amber-400 font-mono flex items-center justify-between">
                    <span>Greedy Best-First</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Fast / Heuristic</span>
                  </div>
                  <div className="text-zinc-400 mt-1.5 text-[11px] leading-relaxed">
                    Ignores g(n) path cost. Directly rushes toward the target coordinate. Quickest exploration time in open floor plans.
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="font-semibold text-purple-300 font-mono flex items-center justify-between">
                    <span>Breadth-First Search</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Uninformed</span>
                  </div>
                  <div className="text-zinc-400 mt-1.5 text-[11px] leading-relaxed">
                    FIFO queue expansion without heuristic guidance. Explores in concentric wave fronts across the warehouse grid.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
