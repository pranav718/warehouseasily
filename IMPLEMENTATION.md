# Implementation Tracking: warehouseasily

Autonomous Warehouse Fleet Navigation and Pick-Order Optimization System
AISC University Course Project

## Project Overview and Impact

This project models an automated fulfillment center where Automated Guided Vehicles (AGVs) navigate grid environments to collect orders. It combines two core optimization layers:

1. Macro Level: Simulated Annealing algorithm solves the Travelling Salesperson Problem (TSP) variant to determine the optimal order of item pick stops.
2. Micro Level: A* Search algorithm computes collision-free shortest paths on a 2D warehouse grid with obstacles using admissible heuristics.
3. Comparative Evaluation: Benchmarks A* against Greedy Best-First Search and Breadth-First Search (BFS) to measure search latency, nodes expanded, and path optimality.
4. Visual Interface: Interactive web visualizer built with Next.js, TypeScript, and Tailwind CSS.
5. Systems Engine: Standalone C++17 implementation for low-level performance comparison and course viva demonstration.

---

## Phase Status Summary

### Phase 1: Project Scaffolding and Dashboard Shell
Status: Completed

Completed items:
- Next.js 15, TypeScript, and Tailwind CSS configuration.
- Dark warehouse theme and responsive grid layout shell.
- Global layout without emojis or emdashes.
- Package dependencies resolved and verified with clean production build.
- Implementation tracker initialized.

Impact on project:
- Sets up the interactive visual runtime.
- Establishes zero-friction environment for running the 2D grid canvas and analytics.

---

### Phase 2: Micro-Level Pathfinding Engine
Status: Completed

Completed items:
- Warehouse grid data types in lib/types.ts: Point, GridCell, SearchNode, SearchStep, SearchResult.
- Binary min-heap priority queue in lib/priorityQueue.ts for efficient OPEN set operations.
- Admissible distance heuristics in lib/heuristics.ts: Manhattan (L1), Euclidean (L2), Chebyshev.
- Optimal A* Search in lib/algorithms/astar.ts with tie-breaking and step-by-step generator.
- Greedy Best-First Search in lib/algorithms/greedy.ts with step generator for comparison.
- Uninformed Breadth-First Search in lib/algorithms/bfs.ts with step generator as benchmark baseline.

Impact on project:
- Delivers the core search algorithms required for the AISC syllabus (Lectures 1 to 28).
- Provides step generators so the UI canvas can animate the search frontier expansion.

---

### Phase 3: Macro-Level Pick-Order Sequencing
Status: Completed

Completed items:
- Multi-stop order and Simulated Annealing data structures in lib/types.ts.
- Simulated Annealing engine in lib/algorithms/simulatedAnnealing.ts with geometric cooling schedule (T0 = 1000, alpha = 0.995).
- 2-opt segment reversal and random pairwise swap mutation operators.
- Metropolis acceptance probability function: P(deltaE, T) = exp(-deltaE / T).
- Generator function optimizePickOrderGenerator yielding step data for UI convergence plotting.
- Warehouse fleet dispatch coordinator in lib/coordinator.ts connecting macro TSP tour with micro A* path stitching.

Impact on project:
- Solves the NP-hard multi-item pick sequencing challenge (macro level).
- Prevents fleet robots from executing wasteful zigzag routes across warehouse aisles.
- Provides seamless data pipeline from user order to continuous grid trajectory.

---

### Phase 4: Interactive Web Visualizer
Status: Pending

Planned items:
- Interactive warehouse grid canvas component.
- Obstacle and shelf painting (click and drag).
- Item pickup point placement.
- Step-by-step playback controls (play, pause, step forward, step back, speed slider).
- Frontier visualization (OPEN list, CLOSED list, current node, final path).
- Animated AGV robot movement along the calculated route.

Impact on project:
- Live demonstration for project evaluators and professors.
- Visual proof of heuristic efficiency and path optimality.

---

### Phase 5: Benchmark Matrix and Analytics
Status: Pending

Planned items:
- Side-by-side comparison table (A* vs Greedy vs BFS).
- Metrics tracked: nodes expanded, execution time in milliseconds, path length.
- Annealing convergence chart (Temperature vs Energy).
- Preset warehouse maps (Amazon Kiva pods, dense aisles, maze traps).

Impact on project:
- Delivers the academic requirement for comparing informed vs uninformed search.
- Generates empirical data for project reports and viva questions.

---

### Phase 6: Standalone C++17 Reference Engine
Status: Pending

Planned items:
- C++17 core engine under cpp-core/ directory.
- Standard Library priority queue and hash set implementations.
- CLI runner with benchmark output in terminal.
- CMake and Makefile build scripts.

Impact on project:
- Demonstrates systems-level proficiency for university grading.
- Provides native execution speed comparison against JavaScript.

---

## Progress Log

- 2026-10-13: Initialized repository, git tracking, and project spec.
- 2026-10-13: Completed Phase 1 scaffolding, layout shell, dark theme, and implementation tracker.
- 2026-10-13: Completed Phase 2 search engine (A*, Greedy BFS, uninformed BFS, distance heuristics, priority queue).
- 2026-10-14: Completed Phase 3 order sequencing engine (Simulated Annealing, 2-opt, Metropolis criterion, fleet dispatch coordinator).
