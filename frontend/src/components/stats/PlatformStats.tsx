import React, { useEffect, useState } from "react";
import { getUserId } from "../../utils/userId";

interface Stats {
  status: string;
  startedAt: string;
  uptimeSeconds: number;
  users: number;
  analyzedContracts: number;
}

interface PlatformStatsProps {
  isDarkMode: boolean;
}

function formatUptime(totalSeconds: number): string {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

const PlatformStats: React.FC<PlatformStatsProps> = ({ isDarkMode }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [offline, setOffline] = useState(false);

  // Record a visit once per load.
  useEffect(() => {
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: getUserId() }),
    }).catch(() => {
      /* visit tracking is best-effort */
    });
  }, []);

  // Refresh metrics periodically.
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/stats");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Stats = await res.json();
        if (active) {
          setStats(data);
          setOffline(false);
        }
      } catch {
        if (active) setOffline(true);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const containerClass = `w-full mb-4 px-3 py-2 rounded text-xs ${
    isDarkMode ? "bg-[#1e293b] text-gray-300" : "bg-gray-100 text-gray-700"
  }`;

  if (!stats) {
    return (
      <div className={containerClass}>
        <span className="opacity-70">
          {offline ? "Metrics unavailable" : "Loading metrics…"}
        </span>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">Platform status</span>
        <span className="flex items-center gap-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              offline ? "bg-red-500" : "bg-green-500"
            }`}
          />
          {offline ? "offline" : "online"}
        </span>
      </div>
      <div className="flex justify-between">
        <span>Uptime</span>
        <span>{formatUptime(stats.uptimeSeconds)}</span>
      </div>
      <div className="flex justify-between">
        <span>Users</span>
        <span>{stats.users.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Contracts analyzed</span>
        <span>{stats.analyzedContracts.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default PlatformStats;
