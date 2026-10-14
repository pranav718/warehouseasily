"use client";

import React from "react";
import { AlgorithmType, HeuristicType } from "../lib/types";

export interface PlaybackControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  algorithm: AlgorithmType;
  heuristic: HeuristicType;
  useAnnealing: boolean;
  editMode: "shelf" | "start" | "pickup" | "dropoff" | "erase";
  selectedPreset: string;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onClearShelves: () => void;
  onSpeedChange: (speed: number) => void;
  onAlgorithmChange: (alg: AlgorithmType) => void;
  onHeuristicChange: (h: HeuristicType) => void;
  onUseAnnealingChange: (v: boolean) => void;
  onEditModeChange: (m: "shelf" | "start" | "pickup" | "dropoff" | "erase") => void;
  onPresetChange: (presetId: string) => void;
}

export function PlaybackControls({
  isRunning,
  isPaused,
  speed,
  algorithm,
  heuristic,
  useAnnealing,
  editMode,
  selectedPreset,
  onPlay,
  onPause,
  onStep,
  onReset,
  onClearShelves,
  onSpeedChange,
  onAlgorithmChange,
  onHeuristicChange,
  onUseAnnealingChange,
  onEditModeChange,
  onPresetChange,
}: PlaybackControlsProps) {
  const speeds = [1, 2, 5, 10, 25];

  const editButtons: { mode: "shelf" | "start" | "pickup" | "dropoff" | "erase"; label: string }[] = [
    { mode: "shelf", label: "Shelf" },
    { mode: "start", label: "Start (S)" },
    { mode: "pickup", label: "Pickup (P)" },
    { mode: "dropoff", label: "Dock (D)" },
    { mode: "erase", label: "Eraser" },
  ];

  return (
    <div className="flex flex-col gap-4 bg-slate-900/70 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          {!isRunning || isPaused ? (
            <button
              type="button"
              onClick={onPlay}
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs tracking-wider uppercase transition-colors"
            >
              {isPaused ? "Resume" : "Run Simulation"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs tracking-wider uppercase transition-colors"
            >
              Pause
            </button>
          )}

          <button
            type="button"
            onClick={onStep}
            disabled={isRunning && !isPaused}
            className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 disabled:opacity-50 transition-colors"
          >
            Step
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            Reset
          </button>

          <button
            type="button"
            onClick={onClearShelves}
            className="px-3 py-2 rounded-md bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-mono border border-rose-900/50 transition-colors"
          >
            Clear Shelves
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
          <span className="text-[10px] font-mono uppercase text-slate-500 px-2">Speed</span>
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                speed === s
                  ? "bg-cyan-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-mono uppercase text-slate-400">Grid Painter Tool</label>
        <div className="grid grid-cols-5 gap-2">
          {editButtons.map((btn) => (
            <button
              key={btn.mode}
              type="button"
              onClick={() => onEditModeChange(btn.mode)}
              className={`py-2 px-1 text-center text-xs font-mono rounded border transition-colors ${
                editMode === btn.mode
                  ? "bg-cyan-950 border-cyan-500 text-cyan-200 font-bold"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Layout Preset</label>
          <select
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-600 font-mono"
          >
            <option value="kiva">Amazon Kiva Pods</option>
            <option value="dense">Dense Storage Aisles</option>
            <option value="trap">U-Shaped Obstacle Trap</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Pathfinding Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-600 font-mono"
          >
            <option value="astar">A* Search (Optimal f = g + h)</option>
            <option value="greedy">Greedy Best-First (f = h)</option>
            <option value="bfs">Breadth-First Search (Uninformed)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-slate-400 block mb-1">Distance Heuristic</label>
          <select
            value={heuristic}
            disabled={algorithm === "bfs"}
            onChange={(e) => onHeuristicChange(e.target.value as HeuristicType)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-600 font-mono disabled:opacity-40"
          >
            <option value="manhattan">Manhattan Distance (L1)</option>
            <option value="euclidean">Euclidean Distance (L2)</option>
            <option value="chebyshev">Chebyshev Distance (L-inf)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="annealing-toggle"
            checked={useAnnealing}
            onChange={(e) => onUseAnnealingChange(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="annealing-toggle" className="text-xs font-mono text-slate-300 cursor-pointer">
            Simulated Annealing Multi-Stop Pick Sequencing
          </label>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {useAnnealing ? "Macro TSP: Active" : "Naive Sequential: Active"}
        </span>
      </div>
    </div>
  );
}
