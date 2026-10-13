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
Status: Pending

Planned items:
- Warehouse grid data types: Cell, Obstacle, Shelf, Pickup, Dropoff, Robot.
- Admissible distance heuristics: Manhattan (L1), Euclidean (L2), Chebyshev.
- A* Search implementation using priority queue and step-by-step generator.
- Greedy Best-First Search implementation.
- Breadth-First Search implementation as uninformed baseline.

Impact on project:
- Powers point-to-point collision-free robot navigation around warehouse shelves.
- Provides step data for animating the search frontier in the UI.

---

### Phase 3: Macro-Level Pick-Order Sequencing
Status: Pending

Planned items:
- TSP state representation for multi-item orders.
- Simulated Annealing engine with temperature cooling schedule (T0, alpha).
- 2-opt tour mutation operator (swap and reverse).
- Metropolis acceptance criterion: P(accept) = exp(-deltaE / T).
- Integration between macro order sequencing and micro A* path planner.

Impact on project:
- Minimizes total travel distance for complex multi-stop orders.
- Prevents robots from taking naive sequential routes.

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
