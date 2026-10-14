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
import { getPreset, WAREHOUSE_PRESETS } from "../lib/presets";
import { findPathAStarGenerator } from "../lib/algorithms/astar";
import { findPathGreedyGenerator } from "../lib/algorithms/greedy";
import { findPathBFSGenerator } from "../lib/algorithms/bfs";
import { optimizePickOrder } from "../lib/algorithms/simulatedAnnealing";
import { manhattanDistance } from "../lib/heuristics";
import { runComprehensiveBenchmark, FullBenchmarkReport } from "../lib/benchmark";

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
  const [editMode, setEditMode] = useState<"shelf" | "start" | "pickup" | "dropoff" | "erase">("shelf");

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
    nodesExpanded: 0,
    pathLength: 0,
    executionTimeMs: 0,
    initialEnergy: 0,
    finalEnergy: 0,
    annealingSavings: 0,
  });

  const isMouseDownRef = useRef<boolean>(false);
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

  useEffect(() => {
    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
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

  const handleCellAction = (x: number, y: number) => {
    if (isRunning) return;
    const key = `${x},${y}`;

    if (editMode === "shelf") {
      if (
        (start.x === x && start.y === y) ||
        (dropoff.x === x && dropoff.y === y) ||
        pickups.some((p) => p.x === x && p.y === y)
      ) {
        return;
      }
      setShelves((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    } else if (editMode === "erase") {
      setShelves((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      setPickups((prev) => prev.filter((p) => p.x !== x || p.y !== y));
    } else if (editMode === "start") {
      if (!shelves.has(key)) {
        setStart({ x, y });
      }
    } else if (editMode === "dropoff") {
      if (!shelves.has(key)) {
        setDropoff({ x, y });
      }
    } else if (editMode === "pickup") {
      if (!shelves.has(key) && !pickups.some((p) => p.x === x && p.y === y)) {
        setPickups((prev) => [...prev, { x, y }]);
      }
    }
  };

  const handleCellMouseDown = (x: number, y: number) => {
    isMouseDownRef.current = true;
    handleCellAction(x, y);
  };

  const handleCellMouseEnter = (x: number, y: number) => {
    if (!isMouseDownRef.current) return;
    if (editMode === "shelf" || editMode === "erase") {
      handleCellAction(x, y);
    }
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

      setStatusMessage(
        `Pathfinding leg ${legIdx + 1} of ${orderedStops.length - 1} (${algorithm.toUpperCase()})...`
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

  const clearShelves = () => {
    if (isRunning) return;
    setShelves(new Set());
    resetSimulationState();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">warehouseasily</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              AISC University Course Project
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous Warehouse Fleet Navigation and Pick-Order Optimization System
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800">
            <span className="text-slate-500">Status:</span>
            <span className="text-cyan-400 font-semibold">{statusMessage}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">
        <section className="xl:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono">
                  Warehouse Floor Viewport
                </h2>
                <p className="text-xs text-slate-400">
                  {WAREHOUSE_PRESETS[selectedPreset]?.description || "Configurable Warehouse Simulation"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {dimensions.cols} x {dimensions.rows}
                </span>
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Pickups: {pickups.length}
                </span>
                <span className="text-xs font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  Shelves: {shelves.size}
                </span>
              </div>
            </div>

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
              editMode={editMode}
              onCellClick={handleCellAction}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseEnter={handleCellMouseEnter}
            />
          </div>

          <PlaybackControls
            isRunning={isRunning}
            isPaused={isPaused}
            speed={speed}
            algorithm={algorithm}
            heuristic={heuristic}
            useAnnealing={useAnnealing}
            editMode={editMode}
            selectedPreset={selectedPreset}
            onPlay={isPaused ? handleResume : runSimulation}
            onPause={handlePause}
            onStep={handleStep}
            onReset={resetSimulationState}
            onClearShelves={clearShelves}
            onSpeedChange={setSpeed}
            onAlgorithmChange={setAlgorithm}
            onHeuristicChange={setHeuristic}
            onUseAnnealingChange={setUseAnnealing}
            onEditModeChange={setEditMode}
            onPresetChange={loadPreset}
          />

          <BenchmarkPanel
            report={benchmarkReport}
            isBenchmarking={isBenchmarking}
            onRunBenchmark={() =>
              triggerBenchmark(start, dropoff, pickups, dropoff, dimensions, shelves)
            }
          />
        </section>

        <aside className="xl:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono border-b border-slate-800 pb-2">
              Execution Telemetry
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Nodes Expanded</span>
                <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                  {metrics.nodesExpanded}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Path Distance</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  {metrics.pathLength}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Search Time</span>
                <span className="text-xl font-bold font-mono text-purple-400 mt-1 block">
                  {metrics.executionTimeMs} ms
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded p-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Anneal Savings</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                  {metrics.annealingSavings} cells
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono border-b border-slate-800 pb-2">
              Algorithmic Comparison
            </h2>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-cyan-400 font-mono">A* Search (Informed)</div>
                <div className="text-slate-400 mt-1 text-[11px]">
                  f(n) = g(n) + h(n). Guaranteed optimal path with admissible heuristic. Expands only nodes directed toward goal.
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-amber-400 font-mono">Greedy Best-First</div>
                <div className="text-slate-400 mt-1 text-[11px]">
                  f(n) = h(n). Ignores path cost g(n). Fast in open space, but susceptible to traps and suboptimal detours.
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-purple-400 font-mono">Breadth-First (BFS)</div>
                <div className="text-slate-400 mt-1 text-[11px]">
                  Uninformed search. Expands all directions equally. Guarantees shortest path on unweighted grid, but high memory usage.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 text-xs text-slate-400">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono border-b border-slate-800 pb-2">
              Course Details
            </h2>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span>Course</span>
              <span className="font-mono text-slate-200">AISC (Lectures 1-28)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span>Domain</span>
              <span className="text-slate-200">Automated Guided Vehicles</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span>Phase 1-3</span>
              <span className="text-emerald-400">Algorithms & Coordinator</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/50">
              <span>Phase 4</span>
              <span className="text-emerald-400">Interactive Visualizer</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Phase 5</span>
              <span className="text-emerald-400">Benchmark Matrix</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
