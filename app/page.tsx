export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white">warehouseasily</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              AISC Course Project
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous Warehouse Fleet Navigation and Pick-Order Optimization
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Micro: A* Search
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Macro: Simulated Annealing
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <section className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col min-h-[520px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Warehouse Floor Simulation
                </h2>
                <p className="text-xs text-slate-500">Interactive 2D Grid with Static Shelves and Dynamic Routing</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                  Grid: 24 x 16
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                  Status: Ready
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-800 rounded-lg mt-4 bg-slate-950/40">
              <div className="w-12 h-12 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-lg font-bold mb-3">
                2D
              </div>
              <h3 className="text-base font-medium text-slate-200">Grid Canvas Ready for Phase 2</h3>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Phase 1 scaffold complete. Next phase implements the grid model, distance heuristics (Manhattan and Euclidean), and A* search expansion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Algorithm Mode</span>
              <div className="text-lg font-bold text-slate-100 mt-1">A* Pathfinding</div>
              <div className="text-xs text-slate-500 mt-1">f(n) = g(n) + h(n) with Manhattan heuristic</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Order Optimization</span>
              <div className="text-lg font-bold text-slate-100 mt-1">Simulated Annealing</div>
              <div className="text-xs text-slate-500 mt-1">Meta-heuristic TSP pick sequence solver</div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Comparison Target</span>
              <div className="text-lg font-bold text-slate-100 mt-1">Greedy BFS vs BFS</div>
              <div className="text-xs text-slate-500 mt-1">Benchmarking node expansion and latency</div>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Dispatch Controls
            </h2>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Search Heuristic</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-600">
                  <option value="manhattan">Manhattan Distance (L1)</option>
                  <option value="euclidean">Euclidean Distance (L2)</option>
                  <option value="chebyshev">Chebyshev Distance (L-inf)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Comparison Algorithm</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-600">
                  <option value="astar">A* Search (Optimal)</option>
                  <option value="greedy">Greedy Best-First Search</option>
                  <option value="bfs">Breadth-First Search (Uninformed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Warehouse Preset</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-600">
                  <option value="kiva">Amazon Kiva Standard Pods</option>
                  <option value="dense">Dense Storage Aisles</option>
                  <option value="maze">U-Shaped Obstacle Trap</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                disabled
                className="w-full py-2 px-3 rounded-md bg-cyan-700/40 text-cyan-300/60 border border-cyan-800/40 text-xs font-medium cursor-not-allowed"
              >
                Execute Optimization (Phase 2)
              </button>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
              Course Details
            </h2>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-mono text-slate-300">AISC (Univ)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phase 2:</span>
                <span className="text-slate-300">A* Pathfinding</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phase 3:</span>
                <span className="text-slate-300">Simulated Annealing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phase 6:</span>
                <span className="text-slate-300">C++17 Reference Engine</span>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
