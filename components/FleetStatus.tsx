"use client";

import React from "react";
import { BatteryFull, BatteryMedium, BatteryLow } from "lucide-react";
import { Point } from "../lib/types";

export interface FleetStatusProps {
  robotPosition: Point | null;
  isRunning: boolean;
  isPaused: boolean;
  statusMessage: string;
}

export function FleetStatus({
  robotPosition,
  isRunning,
  isPaused,
}: FleetStatusProps) {
  const robots = [
    {
      id: "AMR-01",
      status: isRunning && !isPaused ? "moving" : robotPosition ? "assigned" : "idle",
      battery: 92,
      color: "#38bdf8",
      coord: robotPosition ? `(${robotPosition.x}, ${robotPosition.y})` : "(0, 0)",
    },
    {
      id: "AMR-02",
      status: "idle",
      battery: 94,
      color: "#f43f5e",
      coord: "(13, 2)",
    },
    {
      id: "AMR-03",
      status: "idle",
      battery: 84,
      color: "#22c55e",
      coord: "(17, 10)",
    },
  ];

  return (
    <div className="bg-[#12161F]/35 backdrop-blur-xl rounded-xl border border-white/10 flex flex-col shadow-xl overflow-hidden">
      <div className="h-12 px-5 border-b border-white/10 flex justify-between items-center bg-white/[0.03] backdrop-blur-sm shrink-0">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-100 font-mono">fleet status</h3>
        <span className="text-xs text-zinc-300 font-mono">
          active: <span className="text-[#C9F27D] font-semibold">{isRunning ? "1 / 3" : "3 / 3"}</span>
        </span>
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        {robots.map((r) => {
          const batteryColor = r.battery > 70 ? "#C9F27D" : r.battery > 30 ? "#fbbf24" : "#f87171";
          const batteryTextColor =
            r.battery > 70 ? "text-[#C9F27D]" : r.battery > 30 ? "text-amber-400" : "text-rose-400";

          return (
            <div
              key={r.id}
              className="px-3.5 py-2 rounded-lg flex items-center justify-between border border-transparent hover:border-white/10 hover:bg-white/[0.03] transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3.5 h-3.5 rounded-full relative shrink-0"
                  style={{
                    backgroundColor: r.color,
                    boxShadow: `0 0 10px ${r.color}`,
                  }}
                >
                  {r.status === "moving" && (
                    <span className="absolute -inset-1 rounded-full border border-white animate-ping opacity-60" />
                  )}
                </div>

                <div>
                  <div className="font-mono font-bold text-sm text-[#E6E9EF] tracking-wide flex items-center gap-2">
                    <span>{r.id}</span>
                    <span className="text-[10px] font-normal text-zinc-400">{r.coord}</span>
                  </div>
                  <div className="text-[12px] text-zinc-300 mt-0.5 flex items-center gap-1.5">
                    {r.status === "moving" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9F27D] animate-pulse" />
                    )}
                    <span className="font-mono capitalize text-zinc-400">{r.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 font-mono font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] text-[#E6E9EF] tabular-nums">{r.battery}%</span>
                  {r.battery > 70 ? (
                    <BatteryFull size={16} className={batteryTextColor} strokeWidth={2} />
                  ) : r.battery > 30 ? (
                    <BatteryMedium size={16} className={batteryTextColor} strokeWidth={2} />
                  ) : (
                    <BatteryLow size={16} className={batteryTextColor} strokeWidth={2} />
                  )}
                </div>
                <div className="w-14 h-1 bg-white/[0.08] border border-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${r.battery}%`,
                      backgroundColor: batteryColor,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
