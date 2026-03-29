import React from "react";

export default function AnalysisModal({ data, onClose }) {
  if (!data) return null;

  const { product, alternatives, biasScore, categoryAvgFemale, categoryAvgMale } = data;

  const BIAS_CONFIG = {
    High:     { color: "#ef4444", label: "High Pink Tax 🔴" },
    Moderate: { color: "#f97316", label: "Moderate Pink Tax 🟠" },
    Low:      { color: "#eab308", label: "Low Pink Tax 🟡" },
    Fair:     { color: "#22c55e", label: "Fairly Priced 🟢" },
  };

  const cfg = biasScore ? BIAS_CONFIG[biasScore.label] : BIAS_CONFIG["Fair"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>{product.name}</h2>
          <span className="modal-brand">{product.brand} · {product.category}</span>
        </div>

        {biasScore && (
          <div className="modal-bias" style={{ borderColor: cfg.color }}>
            <div className="modal-bias-label" style={{ color: cfg.color }}>
              {cfg.label}
            </div>
            <div className="modal-stats">
              <div className="stat">
                <span className="stat-val">₹{product.price}</span>
                <span className="stat-label">Women's Price</span>
              </div>
              <div className="stat-arrow">→</div>
              <div className="stat">
                <span className="stat-val" style={{ color: "#22c55e" }}>
                  ₹{alternatives[0]?.price || "N/A"}
                </span>
                <span className="stat-label">Equivalent</span>
              </div>
              <div className="stat">
                <span className="stat-val" style={{ color: cfg.color }}>
                  +{biasScore.percentDiff}%
                </span>
                <span className="stat-label">Markup</span>
              </div>
              <div className="stat">
                <span className="stat-val" style={{ color: cfg.color }}>
                  ₹{biasScore.lifetimeCost}
                </span>
                <span className="stat-label">Extra/Year</span>
              </div>
            </div>
          </div>
        )}

        {categoryAvgFemale && categoryAvgMale && (
          <div className="category-avg">
            <h4>📊 Category Average — {product.category}</h4>
            <div className="avg-row">
              <div className="avg-bar-label">Women's avg: ₹{categoryAvgFemale.toFixed(0)}</div>
              <div className="avg-bar-bg">
                <div
                  className="avg-bar-fill female"
                  style={{ width: `${(categoryAvgFemale / (categoryAvgFemale + categoryAvgMale)) * 100}%` }}
                />
              </div>
            </div>
            <div className="avg-row">
              <div className="avg-bar-label">Men's avg: ₹{categoryAvgMale.toFixed(0)}</div>
              <div className="avg-bar-bg">
                <div
                  className="avg-bar-fill male"
                  style={{ width: `${(categoryAvgMale / (categoryAvgFemale + categoryAvgMale)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {alternatives && alternatives.length > 0 && (
          <div className="alternatives">
            <h4>💚 Fairer Alternatives</h4>
            <div className="alt-grid">
              {alternatives.map((alt) => (
                <div key={alt._id} className="alt-card">
                  <img
                    src={alt.image || "https://via.placeholder.com/60"}
                    alt={alt.name}
                    className="alt-img"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=💚"; }}
                  />
                  <div>
                    <div className="alt-name">{alt.name}</div>
                    <div className="alt-price">₹{alt.price}</div>
                    <div className="alt-save">
                      Save ₹{product.price - alt.price} (₹{(product.price - alt.price) * 12}/yr)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
