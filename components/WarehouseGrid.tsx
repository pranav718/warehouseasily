"use client";

import React from "react";
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
  editMode: "shelf" | "start" | "pickup" | "dropoff" | "erase";
  onCellClick: (x: number, y: number) => void;
  onCellMouseDown: (x: number, y: number) => void;
  onCellMouseEnter: (x: number, y: number) => void;
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
  editMode,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
}: WarehouseGridProps) {
  const openSetKeys = React.useMemo(() => {
    return new Set(openSet.map((p) => `${p.x},${p.y}`));
  }, [openSet]);

  const closedSetKeys = React.useMemo(() => {
    return new Set(closedSet.map((p) => `${p.x},${p.y}`));
  }, [closedSet]);

  const pathKeys = React.useMemo(() => {
    return new Set(path.map((p) => `${p.x},${p.y}`));
  }, [path]);

  const pickupIndexMap = React.useMemo(() => {
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

  return (
    <div className="flex flex-col gap-3 select-none">
      <div
        className="grid gap-[2px] p-3 bg-slate-950 border border-slate-800 rounded-lg overflow-auto shadow-inner"
        style={{
          gridTemplateColumns: `repeat(${dimensions.cols}, minmax(0, 1fr))`,
        }}
        onMouseLeave={() => {}}
      >
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

            let bgClass = "bg-slate-900/80 hover:bg-slate-800/80";
            let content: React.ReactNode = null;

            if (isShelfCell) {
              bgClass = "bg-slate-700 border-slate-600";
            } else if (isRobotCell) {
              bgClass = "bg-amber-500 border-amber-300 ring-2 ring-amber-400";
              content = <span className="text-[10px] font-black text-slate-950 font-mono">AGV</span>;
            } else if (isStartCell) {
              bgClass = "bg-cyan-600 border-cyan-400 ring-2 ring-cyan-500/50";
              content = <span className="text-[10px] font-black text-white font-mono">S</span>;
            } else if (isDropoffCell) {
              bgClass = "bg-emerald-600 border-emerald-400 ring-2 ring-emerald-500/50";
              content = <span className="text-[10px] font-black text-white font-mono">D</span>;
            } else if (isPickupCell) {
              bgClass = "bg-purple-600 border-purple-400 ring-1 ring-purple-300";
              content = (
                <span className="text-[10px] font-bold text-white font-mono">
                  P{pickupNum}
                </span>
              );
            } else if (isCurrent) {
              bgClass = "bg-rose-500 border-rose-300 animate-pulse";
            } else if (isPathCell) {
              bgClass = "bg-emerald-500/80 border-emerald-400/90 shadow-sm";
            } else if (isOpenCell) {
              bgClass = "bg-cyan-900/60 border-cyan-700/60";
            } else if (isClosedCell) {
              bgClass = "bg-indigo-950/60 border-indigo-900/50";
            }

            return (
              <button
                key={key}
                type="button"
                onMouseDown={() => onCellMouseDown(x, y)}
                onMouseEnter={() => onCellMouseEnter(x, y)}
                onClick={() => onCellClick(x, y)}
                className={`w-6 h-6 md:w-7 md:h-7 rounded-[3px] border border-slate-800/70 flex items-center justify-center transition-colors duration-75 text-center cursor-pointer ${bgClass}`}
                title={`(${x}, ${y})`}
              >
                {content}
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-slate-400 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-cyan-600 border border-cyan-400 inline-block text-[9px] text-white font-bold text-center leading-3">S</span>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-400 inline-block text-[9px] text-white font-bold text-center leading-3">D</span>
          <span>Dock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-purple-600 border border-purple-400 inline-block text-[9px] text-white font-bold text-center leading-3">P</span>
          <span>Pickup</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600 inline-block"></span>
          <span>Shelf</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-cyan-900/70 border border-cyan-700 inline-block"></span>
          <span>Open Set</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-indigo-950 border border-indigo-900 inline-block"></span>
          <span>Closed Set</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-400 inline-block"></span>
          <span>Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-300 inline-block text-[8px] text-slate-950 font-bold text-center leading-3">A</span>
          <span>Robot</span>
        </div>
      </div>
    </div>
  );
}
