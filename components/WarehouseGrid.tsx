"use client";

import React, { useMemo } from "react";
import { Point, GridDimensions } from "../lib/types";

export interface WarehouseGridProps {
  dimensions: GridDimensions;
  shelves: Set<string>;
  start: Point;
  pickups: Point[];
  dropoff: Point;
  openSet: Point[];
  closedSet: Point[];
  currentPoint: Point | null;
  path: Point[];
  robotPosition: Point | null;
  editMode?: "shelf" | "start" | "pickup" | "dropoff" | "erase";
  onCellClick?: (x: number, y: number) => void;
  onCellMouseDown?: (x: number, y: number) => void;
  onCellMouseEnter?: (x: number, y: number) => void;
}

export function WarehouseGrid({
  dimensions,
  shelves,
  start,
  pickups,
  dropoff,
  openSet,
  closedSet,
  currentPoint,
  path,
  robotPosition,
}: WarehouseGridProps) {
  const openSetKeys = useMemo(() => {
    return new Set(openSet.map((p) => `${p.x},${p.y}`));
  }, [openSet]);

  const closedSetKeys = useMemo(() => {
    return new Set(closedSet.map((p) => `${p.x},${p.y}`));
  }, [closedSet]);

  const pathKeys = useMemo(() => {
    return new Set(path.map((p) => `${p.x},${p.y}`));
  }, [path]);

  const pickupIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    pickups.forEach((p, idx) => {
      map.set(`${p.x},${p.y}`, idx + 1);
    });
    return map;
  }, [pickups]);

  const isStart = (x: number, y: number) => start.x === x && start.y === y;
  const isDropoff = (x: number, y: number) => dropoff.x === x && dropoff.y === y;
  const isRobot = (x: number, y: number) =>
    robotPosition !== null && robotPosition.x === x && robotPosition.y === y;

  const aisleLanes = useMemo(() => {
    const horizontalRows = [4, 8, 12].filter((r) => r < dimensions.rows);
    const verticalCols = [6, 12, 18].filter((c) => c < dimensions.cols);
    return { horizontalRows, verticalCols };
  }, [dimensions.rows, dimensions.cols]);

  return (
    <div className="border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md rounded-xl flex flex-col overflow-hidden shadow-2xl relative select-none">
      <div className="h-12 border-b border-zinc-800/80 flex items-center justify-between px-6 bg-zinc-950/40 backdrop-blur-sm shrink-0 z-10">
        <h2 className="font-mono text-sm font-semibold tracking-wide text-zinc-200">
          warehouse layout (2d)
        </h2>
        <span className="font-mono text-xs text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10">
          grid: {dimensions.cols}x{dimensions.rows}
        </span>
      </div>

      <div className="flex-1 bg-black/40 backdrop-blur-sm pt-8 pl-9 pr-4 pb-4 flex items-center justify-center overflow-x-auto relative">
        <div
          className="relative grid gap-[1.5px] p-2 bg-[#090C11] border border-white/10 rounded-lg shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: dimensions.cols }).map((_, i) => (
            <div
              key={`col-${i}`}
              className="absolute top-[-22px] text-[10px] text-[#A8B2C4] font-mono font-medium -translate-x-1/2 pointer-events-none select-none"
              style={{ left: `calc((100% / ${dimensions.cols}) * ${i + 0.5})` }}
            >
              {i}
            </div>
          ))}

          {Array.from({ length: dimensions.rows }).map((_, i) => (
            <div
              key={`row-${i}`}
              className="absolute left-[-22px] text-[10px] text-[#A8B2C4] font-mono font-medium -translate-y-1/2 pointer-events-none select-none"
              style={{ top: `calc((100% / ${dimensions.rows}) * ${i + 0.5})` }}
            >
              {i}
            </div>
          ))}

          {aisleLanes.horizontalRows.map((y) => (
            <div
              key={`lane-h-${y}`}
              className="absolute pointer-events-none border-b border-dashed border-[#545C6B]/40 w-full z-0"
              style={{
                top: `calc(100% * ${y + 0.5} / ${dimensions.rows})`,
                left: 0,
              }}
            />
          ))}

          {aisleLanes.verticalCols.map((x) => (
            <div
              key={`lane-v-${x}`}
              className="absolute pointer-events-none border-r border-dashed border-[#545C6B]/40 h-full z-0"
              style={{
                left: `calc(100% * ${x + 0.5} / ${dimensions.cols})`,
                top: 0,
              }}
            />
          ))}

          {Array.from({ length: dimensions.rows }).map((_, y) =>
            Array.from({ length: dimensions.cols }).map((_, x) => {
              const key = `${x},${y}`;
              const isShelfCell = shelves.has(key);
              const isStartCell = isStart(x, y);
              const isDropoffCell = isDropoff(x, y);
              const pickupNum = pickupIndexMap.get(key);
              const isPickupCell = pickupNum !== undefined;
              const isPathCell = pathKeys.has(key);
              const isOpenCell = openSetKeys.has(key);
              const isClosedCell = closedSetKeys.has(key);
              const isCurrent = currentPoint && currentPoint.x === x && currentPoint.y === y;
              const isRobotCell = isRobot(x, y);

              let cellClasses =
                "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border border-white/[0.05] rounded-[2px] flex items-center justify-center transition-all duration-75 relative";
              let content: React.ReactNode = null;

              if (isRobotCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-[#38bdf8] border-2 border-white flex items-center justify-center shadow-[0_0_16px_#38bdf8] z-30 animate-pulse";
                content = (
                  <>
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm" />
                    <div className="absolute top-full mt-1 bg-[#090C11]/95 border border-white/20 text-[9px] font-mono font-bold text-zinc-200 px-1 py-0.2 rounded shadow-lg pointer-events-none whitespace-nowrap z-40">
                      AMR-01
                    </div>
                  </>
                );
              } else if (isShelfCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#181E29] border border-[#283242] p-[1.5px] rounded-[3px] shadow-sm flex flex-col justify-between z-10";
                content = (
                  <>
                    <div className="w-full h-[40%] bg-[#222B3A] border border-[#323F52] rounded-[1px]" />
                    <div className="w-full h-[40%] bg-[#222B3A] border border-[#323F52] rounded-[1px]" />
                  </>
                );
              } else if (isStartCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#0284c7] border border-sky-300 rounded-[3px] flex items-center justify-center shadow-[0_0_12px_rgba(2,132,199,0.5)] z-20";
                content = (
                  <span className="text-[10px] font-mono font-black text-white">S</span>
                );
              } else if (isDropoffCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-amber-500/20 border-2 border-amber-400 rounded-[3px] flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.4)] z-20";
                content = (
                  <span className="text-[10px] font-mono font-black text-amber-300">D</span>
                );
              } else if (isPickupCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#22c55e] border border-emerald-300 rounded-[3px] flex items-center justify-center shadow-[0_0_18px_rgba(34,197,94,0.45)] z-20";
                content = (
                  <span className="text-[10px] font-mono font-black text-[#090C11]">
                    p{pickupNum}
                  </span>
                );
              } else if (isCurrent) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-amber-500/40 border border-amber-300 rounded-[2px] flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.6)] z-20 animate-pulse";
              } else if (isPathCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-[#38bdf8]/20 border border-[#38bdf8]/60 rounded-[2px] flex items-center justify-center shadow-[0_0_8px_rgba(56,189,248,0.3)] z-10";
                content = <div className="w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]" />;
              } else if (isOpenCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-cyan-950/40 border border-cyan-800/40 rounded-[2px] flex items-center justify-center";
              } else if (isClosedCell) {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-zinc-800/30 border border-zinc-700/20 rounded-[2px] flex items-center justify-center";
              } else {
                cellClasses =
                  "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] rounded-[2px] flex items-center justify-center";
              }

              return (
                <div key={key} className={cellClasses} title={`(${x}, ${y})`}>
                  {content}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-6 py-3 border-t border-zinc-800/80 bg-zinc-950/40 text-xs font-mono text-zinc-400 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#0284c7] border border-sky-300 inline-flex items-center justify-center text-[9px] text-white font-bold">
            S
          </span>
          <span>Start Station</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border-2 border-amber-400 inline-flex items-center justify-center text-[9px] text-amber-300 font-bold">
            D
          </span>
          <span>Dock Station</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#22c55e] border border-emerald-300 inline-flex items-center justify-center text-[9px] text-[#090C11] font-bold">
            p
          </span>
          <span>Pickups</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#181E29] border border-[#283242] inline-block" />
          <span>Storage Pod</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-[#38bdf8]/20 border border-[#38bdf8]/60 inline-flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
          </span>
          <span>Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-cyan-950/50 border border-cyan-800/40 inline-block" />
          <span>Open Set</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-zinc-800/40 border border-zinc-700/30 inline-block" />
          <span>Closed Set</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#38bdf8] border border-white inline-block shadow-[0_0_6px_#38bdf8]" />
          <span>AMR Robot</span>
        </div>
      </div>
    </div>
  );
}
