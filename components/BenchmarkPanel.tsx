"use client";

import React from "react";
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
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-200 font-mono">
            Comparative Search Benchmark
          </h2>
          <p className="text-xs text-slate-400">
            Head-to-head performance matrix across informed and uninformed search strategies
          </p>
        </div>

        <button
          type="button"
          disabled={isBenchmarking}
          onClick={onRunBenchmark}
          className="px-4 py-2 rounded-md bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-mono text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          {isBenchmarking ? "Evaluating..." : "Run Benchmark Suite"}
        </button>
      </div>

      {report ? (
        <div className="flex flex-col gap-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Algorithm</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Heuristic</th>
                  <th className="py-2.5 px-3">Nodes Expanded</th>
                  <th className="py-2.5 px-3">Path Length</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Optimality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.pathfindingResults.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{row.name}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] ${
                          row.type === "Informed"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : "bg-purple-950 text-purple-300 border border-purple-800"
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{row.heuristic}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-400">{row.nodesExpanded}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {row.success ? row.pathLength : "No Path"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{row.executionTimeMs} ms</td>
                    <td className="py-2.5 px-3">
                      {row.isOptimal ? (
                        <span className="text-emerald-400 font-bold">Optimal</span>
                      ) : (
                        <span className="text-amber-400 font-semibold">Suboptimal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {report.annealingSummary && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold">
                Simulated Annealing Pick Tour Sequencing (Macro Level)
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Initial Tour</span>
                  <span className="text-sm font-bold font-mono text-slate-200 mt-1 block">
                    {report.annealingSummary.initialDistance} cells
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Optimized Tour</span>
                  <span className="text-sm font-bold font-mono text-emerald-400 mt-1 block">
                    {report.annealingSummary.optimizedDistance} cells
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Distance Saved</span>
                  <span className="text-sm font-bold font-mono text-cyan-400 mt-1 block">
                    {report.annealingSummary.cellsSaved} cells ({report.annealingSummary.percentSaved}%)
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">Iterations</span>
                  <span className="text-sm font-bold font-mono text-purple-400 mt-1 block">
                    {report.annealingSummary.iterations} steps ({report.annealingSummary.executionTimeMs} ms)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-[11px] font-mono text-slate-400 bg-slate-950/40 p-3 rounded border border-slate-800/80">
            <span className="text-cyan-400 font-bold">Academic Evaluation Note: </span>
            A* Search with Manhattan heuristic maintains strict admissibility and expands substantially fewer nodes than uninformed BFS while guaranteeing shortest path optimality. Greedy Best-First minimizes latency in open space but suffers significant path degradation in obstacle dense configurations.
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg bg-slate-950/30">
          <p className="text-xs text-slate-400 font-mono">
            Click Run Benchmark Suite to execute A*, Greedy Best-First, BFS, and Simulated Annealing simultaneously on the active warehouse layout.
          </p>
        </div>
      )}
    </div>
  );
}
