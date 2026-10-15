"use client";

import React from "react";
import { Play, Pause, SkipForward, RotateCcw, SlidersHorizontal } from "lucide-react";
import { AlgorithmType, HeuristicType } from "../lib/types";

export interface PlaybackControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  algorithm: AlgorithmType;
  heuristic: HeuristicType;
  useAnnealing: boolean;
  selectedPreset: string;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onAlgorithmChange: (alg: AlgorithmType) => void;
  onHeuristicChange: (h: HeuristicType) => void;
  onUseAnnealingChange: (v: boolean) => void;
  onPresetChange: (presetId: string) => void;
  editMode?: "shelf" | "start" | "pickup" | "dropoff" | "erase";
  onEditModeChange?: (m: "shelf" | "start" | "pickup" | "dropoff" | "erase") => void;
  onClearShelves?: () => void;
}

export function PlaybackControls({
  isRunning,
  isPaused,
  speed,
  algorithm,
  heuristic,
  useAnnealing,
  selectedPreset,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  onAlgorithmChange,
  onHeuristicChange,
  onUseAnnealingChange,
  onPresetChange,
}: PlaybackControlsProps) {
  const speeds = [1, 2, 5, 10, 25];

  return (
    <div className="bg-[#12161F]/35 backdrop-blur-xl p-5 rounded-xl border border-white/10 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#C9F27D]" />
          <h3 className="text-sm font-semibold tracking-wide text-zinc-100 font-mono">control panel</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning && !isPaused
                ? "bg-[#C9F27D] shadow-[0_0_8px_#C9F27D] animate-pulse"
                : "bg-zinc-600"
            }`}
          />
          <span className="font-mono text-zinc-400">
            simulation:{" "}
            <span
              className={
                isRunning && !isPaused ? "text-[#C9F27D] font-bold" : "text-zinc-500"
              }
            >
              {isRunning ? (isPaused ? "paused" : "active") : "ready"}
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isRunning || isPaused ? (
            <button
              type="button"
              onClick={onPlay}
              className="bg-[#C9F27D]/10 border border-[#C9F27D]/40 text-[#C9F27D] hover:bg-[#C9F27D] hover:text-[#090C11] hover:border-[#C9F27D] hover:shadow-[0_0_15px_rgba(201,242,125,0.35)] px-4 py-2 rounded-md text-[12px] font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer select-none"
            >
              <Play size={14} strokeWidth={2.5} />
              <span>{isPaused ? "resume" : "start sim"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="bg-[#C9F27D]/25 border border-[#C9F27D] text-[#C9F27D] hover:bg-[#C9F27D] hover:text-[#090C11] hover:shadow-[0_0_15px_rgba(201,242,125,0.35)] px-4 py-2 rounded-md text-[12px] font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer select-none"
            >
              <Pause size={14} strokeWidth={2.5} />
              <span>pause sim</span>
            </button>
          )}

          <button
            type="button"
            onClick={onStep}
            disabled={isRunning && !isPaused}
            className="group bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white hover:border-[#C9F27D]/40 hover:bg-[#C9F27D]/10 hover:shadow-[0_0_15px_rgba(201,242,125,0.2)] disabled:opacity-40 px-3.5 py-2 rounded-md text-[12px] font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer select-none"
          >
            <SkipForward size={14} strokeWidth={2.5} />
            <span>step</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="group bg-white/[0.05] border border-white/10 text-zinc-300 hover:text-white hover:border-[#C9F27D]/40 hover:bg-[#C9F27D]/10 hover:shadow-[0_0_15px_rgba(201,242,125,0.2)] px-3.5 py-2 rounded-md text-[12px] font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap cursor-pointer select-none"
          >
            <RotateCcw
              size={14}
              strokeWidth={2.5}
              className="group-hover:-rotate-90 transition-transform duration-300"
            />
            <span>reset</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-white/10">
          <span className="text-[10px] font-mono uppercase text-zinc-500 px-2 select-none">speed</span>
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                speed === s
                  ? "bg-[#C9F27D] text-[#090C11] font-bold shadow-[0_0_8px_rgba(201,242,125,0.35)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-white/10">
        <div>
          <label className="text-xs font-mono text-zinc-400 block mb-1.5 uppercase tracking-wider">
            Layout Preset
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#C9F27D]/60 font-mono transition-colors shadow-inner cursor-pointer"
          >
            <option value="kiva">Amazon Kiva Pods</option>
            <option value="dense">Dense Storage Aisles</option>
            <option value="trap">U-Shaped Obstacle Trap</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-zinc-400 block mb-1.5 uppercase tracking-wider">
            Pathfinding Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#C9F27D]/60 font-mono transition-colors shadow-inner cursor-pointer"
          >
            <option value="astar">A* Search (Optimal f = g + h)</option>
            <option value="greedy">Greedy Best-First (f = h)</option>
            <option value="bfs">Breadth-First Search (Uninformed)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-mono text-zinc-400 block mb-1.5 uppercase tracking-wider">
            Distance Heuristic
          </label>
          <select
            value={heuristic}
            disabled={algorithm === "bfs"}
            onChange={(e) => onHeuristicChange(e.target.value as HeuristicType)}
            className="w-full bg-zinc-950/80 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#C9F27D]/60 font-mono transition-colors shadow-inner disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="manhattan">Manhattan Distance (L1)</option>
            <option value="euclidean">Euclidean Distance (L2)</option>
            <option value="chebyshev">Chebyshev Distance (L-inf)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            id="annealing-toggle"
            checked={useAnnealing}
            onChange={(e) => onUseAnnealingChange(e.target.checked)}
            className="w-4 h-4 rounded bg-zinc-950 border-white/20 text-[#C9F27D] accent-[#C9F27D] focus:ring-0 cursor-pointer"
          />
          <span className="text-xs font-mono text-zinc-300">
            Simulated Annealing Multi-Stop Pick Sequencing
          </span>
        </label>
        <span className="text-[11px] font-mono">
          {useAnnealing ? (
            <span className="text-[#C9F27D] font-semibold">Macro TSP: Active</span>
          ) : (
            <span className="text-zinc-500">Naive Sequential: Active</span>
          )}
        </span>
      </div>
    </div>
  );
}
