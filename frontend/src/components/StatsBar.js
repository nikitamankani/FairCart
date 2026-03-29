import React, { useEffect, useState } from "react";
import { getStats } from "../services/api";

export default function StatsBar() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    getStats()
      .then((res) => setStats(res.data.stats))
      .catch(() => {});
  }, []);

  if (!stats.length) return null;

  const highBias = stats.filter((s) => s.bias?.label === "High").length;
  const totalCategories = stats.length;

  return (
    <div className="stats-bar">
      <div className="stats-headline">
        <span className="stats-icon">📊</span>
        <span>
          <strong>{highBias}/{totalCategories}</strong> categories show High pink tax in our dataset
        </span>
      </div>
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.category} className="stat-pill">
            <span className="stat-cat">{s.category}</span>
            <span
              className="stat-badge"
              style={{
                color:
                  s.bias?.label === "High"     ? "#ef4444" :
                  s.bias?.label === "Moderate" ? "#f97316" :
                  "#22c55e",
              }}
            >
              +{s.bias?.percentDiff || 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
