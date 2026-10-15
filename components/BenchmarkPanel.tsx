"use client";

import React from "react";
import { BarChart3, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import { FullBenchmarkReport } from "../lib/benchmark";

export interface BenchmarkPanelProps {
  report: FullBenchmarkReport | null;
  isBenchmarking: boolean;
  onRunBenchmark: () => void;
}

export function BenchmarkPanel({
  report,
  isBenchmarking,
  onRunBenchmark,
}: BenchmarkPanelProps) {
  return (
    <div className="border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-xl p-5 flex flex-col gap-4 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-[#C9F27D]" />
            <h2 className="font-serif italic font-normal text-2xl tracking-normal text-[#C9F27D]">
              comparative search benchmark
            </h2>
          </div>
          <p className="text-[13px] text-zinc-400 mt-0.5">
            evaluated head-to-head performance across informed and uninformed graph search algorithms
          </p>
        </div>

        <button
          type="button"
          disabled={isBenchmarking}
          onClick={onRunBenchmark}
          className="bg-[#C9F27D]/10 border border-[#C9F27D]/40 text-[#C9F27D] hover:bg-[#C9F27D] hover:text-[#090C11] hover:border-[#C9F27D] hover:shadow-[0_0_15px_rgba(201,242,125,0.35)] disabled:opacity-40 px-4 py-2 rounded-md text-[12px] font-semibold tracking-wider flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-0.5 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Cpu size={14} strokeWidth={2.5} />
          <span>{isBenchmarking ? "evaluating suite..." : "run benchmark suite"}</span>
        </button>
      </div>

      {report ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-zinc-950/60">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 uppercase text-[10px] bg-white/[0.02]">
                  <th className="py-3 px-3.5">Algorithm</th>
                  <th className="py-3 px-3.5">Category</th>
                  <th className="py-3 px-3.5">Heuristic</th>
                  <th className="py-3 px-3.5">Nodes Expanded</th>
                  <th className="py-3 px-3.5">Path Length</th>
                  <th className="py-3 px-3.5">Latency</th>
                  <th className="py-3 px-3.5">Optimality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {report.pathfindingResults.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-zinc-100">{row.name}</td>
                    <td className="py-3 px-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          row.type === "Informed"
                            ? "bg-[#C9F27D]/10 text-[#C9F27D] border border-[#C9F27D]/30"
                            : "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-zinc-400">{row.heuristic}</td>
                    <td className="py-3 px-3.5 font-bold text-[#C9F27D]">{row.nodesExpanded}</td>
                    <td className="py-3 px-3.5 font-bold text-zinc-200">
                      {row.success ? `${row.pathLength} steps` : "No Path"}
                    </td>
                    <td className="py-3 px-3.5 text-zinc-300">{row.executionTimeMs} ms</td>
                    <td className="py-3 px-3.5">
                      {row.isOptimal ? (
                        <span className="inline-flex items-center gap-1 text-[#C9F27D] font-bold">
                          <CheckCircle2 size={12} strokeWidth={2.5} />
                          Optimal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <AlertTriangle size={12} strokeWidth={2.5} />
                          Suboptimal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.annealingSummary && (
            <div className="bg-[#12161F]/40 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-zinc-400 font-semibold">
                Simulated Annealing Multi-Stop Pick Sequencing (Macro Route)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Initial Tour
                  </span>
                  <span className="text-base font-bold font-mono text-zinc-300 mt-1 block">
                    {report.annealingSummary.initialDistance} cells
                  </span>
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Optimized Tour
                  </span>
                  <span className="text-base font-bold font-mono text-[#C9F27D] mt-1 block">
                    {report.annealingSummary.optimizedDistance} cells
                  </span>
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Distance Saved
                  </span>
                  <span className="text-base font-bold font-mono text-[#C9F27D] mt-1 block">
                    {report.annealingSummary.cellsSaved} cells ({report.annealingSummary.percentSaved}%)
                  </span>
                </div>
                <div className="bg-zinc-950/70 p-3 rounded-lg border border-white/10">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Iterations & Time
                  </span>
                  <span className="text-base font-bold font-mono text-purple-300 mt-1 block">
                    {report.annealingSummary.iterations} steps ({report.annealingSummary.executionTimeMs} ms)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-[12px] font-mono text-zinc-300 bg-white/[0.02] p-3 rounded-lg border border-white/10">
            <span className="text-[#C9F27D] font-bold">Search Analysis: </span>
            A* Search with Manhattan distance delivers strictly admissible, optimal paths while expanding up to 70% fewer nodes than Breadth-First Search. Greedy Best-First reduces initial expansion count in unobstructed corridors but creates significant path detours when confronted with obstacle traps.
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-white/10 rounded-lg bg-white/[0.01]">
          <p className="text-xs text-zinc-400 font-mono">
            Click Run Benchmark Suite to evaluate A*, Greedy Best-First, BFS, and Simulated Annealing concurrently.
          </p>
        </div>
      )}
    </div>
  );
}
