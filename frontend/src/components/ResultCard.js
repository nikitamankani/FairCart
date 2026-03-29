import React from "react";

const BIAS_CONFIG = {
  High:     { color: "#ef4444", bg: "#fef2f2", emoji: "🔴", bar: 95 },
  Moderate: { color: "#f97316", bg: "#fff7ed", emoji: "🟠", bar: 60 },
  Low:      { color: "#eab308", bg: "#fefce8", emoji: "🟡", bar: 30 },
  Fair:     { color: "#22c55e", bg: "#f0fdf4", emoji: "🟢", bar: 5  },
};

export default function ResultCard({ product, onAnalyze }) {
  const bias = product.bias;
  const cfg = bias ? BIAS_CONFIG[bias.label] || BIAS_CONFIG["Fair"] : BIAS_CONFIG["Fair"];

  const genderBadge = {
    female:  { label: "For Women 🎀", color: "#ec4899" },
    male:    { label: "For Men",      color: "#3b82f6" },
    neutral: { label: "Neutral",      color: "#6b7280" },
  }[product.gender] || { label: "Unknown", color: "#6b7280" };

  return (
    <div className="result-card" style={{ "--bias-color": cfg.color }}>
      <div className="card-header">
        <img
          src={product.image || "https://via.placeholder.com/100"}
          alt={product.name}
          className="card-img"
          onError={(e) => { e.target.src = "https://via.placeholder.com/100?text=💄"; }}
        />
        <div className="card-meta">
          <span className="brand-tag">{product.brand}</span>
          <h3 className="product-name">{product.name}</h3>
          <span className="gender-badge" style={{ background: genderBadge.color }}>
            {genderBadge.label}
          </span>
        </div>
      </div>

      <div className="price-row">
        <span className="price">₹{product.price}</span>
        {bias && bias.priceDiff > 0 && (
          <span className="price-diff">+₹{bias.priceDiff} vs equivalent</span>
        )}
      </div>

      {bias && (
        <div className="bias-section" style={{ background: cfg.bg }}>
          <div className="bias-header">
            <span>{cfg.emoji} Pink Tax: <strong style={{ color: cfg.color }}>{bias.label}</strong></span>
            <span className="percent-diff">+{bias.percentDiff}%</span>
          </div>
          <div className="bias-bar-bg">
            <div
              className="bias-bar-fill"
              style={{ width: `${cfg.bar}%`, background: cfg.color }}
            />
          </div>
          {bias.lifetimeCost > 0 && (
            <p className="lifetime-cost">
              💸 Extra spend per year: <strong>₹{bias.lifetimeCost.toLocaleString()}</strong>
            </p>
          )}
        </div>
      )}

      {!bias && (
        <div className="bias-section" style={{ background: "#f0fdf4" }}>
          <span>🟢 No bias detected for this product</span>
        </div>
      )}

      <button className="analyze-btn" onClick={() => onAnalyze(product._id)}>
        View Full Analysis →
      </button>
    </div>
  );
}
