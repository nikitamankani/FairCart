import React, { useEffect, useState } from "react";
import { getSavedProducts } from "../services/api";

const BIAS_CONFIG = {
  High:     { color: "#ef4444", bg: "#fef2f2", emoji: "🔴" },
  Moderate: { color: "#f97316", bg: "#fff7ed", emoji: "🟠" },
  Low:      { color: "#eab308", bg: "#fefce8", emoji: "🟡" },
  Fair:     { color: "#22c55e", bg: "#f0fdf4", emoji: "🟢" },
};

export default function SavedProductsModal({ onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedProducts()
      .then((res) => setProducts(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal saved-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-header">
          <h2>Your Saved Products 🎀</h2>
          <span className="modal-brand">
            {products.length} item{products.length !== 1 ? "s" : ""} saved
          </span>
        </div>

        {loading && (
          <div className="loading-state" style={{ padding: "40px 0" }}>
            <div className="loading-ring" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="empty-state" style={{ padding: "40px 0" }}>
            <span>🔖</span>
            <p>No saved products yet. Hit the 🤍 on any product to save it!</p>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="saved-grid">
            {products.map((p) => {
              const cfg = p.bias
                ? BIAS_CONFIG[p.bias.label] || BIAS_CONFIG["Fair"]
                : BIAS_CONFIG["Fair"];
              return (
                <div className="saved-product-card" key={p._id}>
                  <img
                    src={p.image || "https://via.placeholder.com/60"}
                    alt={p.name}
                    className="alt-img"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=💄"; }}
                  />
                  <div className="saved-product-info">
                    <div className="brand-tag">{p.brand}</div>
                    <div className="alt-name">{p.name}</div>
                    <div className="alt-price">₹{p.price}</div>
                    {p.bias && (
                      <span
                        className="saved-bias-badge"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.emoji} {p.bias.label} Pink Tax (+{p.bias.percentDiff}%)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
