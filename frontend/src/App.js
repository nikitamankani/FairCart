import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import ResultCard from "./components/ResultCard";
import AnalysisModal from "./components/AnalysisModal";
import StatsBar from "./components/StatsBar";
import { searchProducts, analyzeProduct } from "./services/api";
import "./index.css";

const MARQUEE_ITEMS = [
  { icon: "💸", text: "Women pay 7–13% more for the same products" },
  { icon: "🛁", text: "Shampoo · Razors · Deodorant · Skincare" },
  { icon: "📊", text: "FairCart exposes the hidden price bias" },
  { icon: "✨", text: "Real-time pink tax detection" },
  { icon: "🌸", text: "Built by Team Cali · PES University" },
  { icon: "🎀", text: "Demand fair pricing" },
];

const POSTER_DATA = [
  { emoji: "💰", title: "Extra spend", stat: "₹15K+", sub: "per woman, per year on pink-taxed products" },
  { emoji: "🛒", title: "Pink Tax hits", stat: "42+", sub: "product categories daily" },
  { emoji: "✂️", title: "Razors", stat: "+13%", sub: "women's vs men's equivalent" },
  { emoji: "🧴", title: "Shampoo", stat: "+11%", sub: "same formula, different price tag" },
];

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState(null);
  const [searched, setSearched] = useState(false);
  const [detectedGender, setDetectedGender] = useState(null);

  const handleSearch = async (query) => {
    setLoading(true);
    setError("");
    setResults([]);
    setSearched(true);
    try {
      const res = await searchProducts(query);
      setResults(res.data.products || []);
      setDetectedGender(res.data.detectedGender);
    } catch (err) {
      setError("Failed to fetch products. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (id) => {
    try {
      const res = await analyzeProduct(id);
      setModalData(res.data);
    } catch (err) {
      setError("Analysis failed.");
    }
  };

  const allMarquee = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">FairCart</span>
          <span className="logo-sub">Pink Tax Detector</span>
        </div>
        <p className="tagline">Exposing the hidden cost of gendered pricing — in real time.</p>
      </header>

      {/* Main */}
      <main className="main">
        {/* Search Hero */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Marquee */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {allMarquee.map((item, i) => (
              <span className="marquee-item" key={i}>
                {item.icon} {item.text}
                <span className="marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* Poster strip - only shown before search */}
        {!searched && (
          <>
            <div className="poster-strip">
              {POSTER_DATA.map((p, i) => (
                <div className="poster-card" key={i}>
                  <div className="poster-emoji">{p.emoji}</div>
                  <div className="poster-title">{p.title}</div>
                  <div className="poster-stat">{p.stat}</div>
                  <div className="poster-sub">{p.sub}</div>
                </div>
              ))}
            </div>

            {/* Sticker row */}
            <div className="sticker-banner">
              <div className="sticker"><span className="sticker-emoji">🎀</span> Pink Tax is real</div>
              <div className="sticker"><span className="sticker-emoji">📉</span> Save up to ₹20K/yr</div>
              <div className="sticker"><span className="sticker-emoji">🔍</span> AI-Powered Detection</div>
              <div className="sticker"><span className="sticker-emoji">💜</span> Free to use</div>
            </div>
          </>
        )}

        {/* Stats */}
        <StatsBar />

        {/* Error */}
        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* Loading */}
        {loading && (
          <div className="loading-state">
            <div className="loading-ring" />
            <p>Analyzing gendered pricing... 🌸</p>
          </div>
        )}

        {/* Empty */}
        {searched && !loading && results.length === 0 && !error && (
          <div className="empty-state">
            <span>🔍</span>
            <p>No products found. Try a different search!</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <div className="results-header">
              <h2 className="results-title">
                {results.length} product{results.length > 1 ? "s" : ""} found
                {detectedGender && detectedGender !== "neutral" && (
                  <span className="gender-detected">
                    · Detected: <strong>{detectedGender}</strong> product
                  </span>
                )}
              </h2>
            </div>
            <div className="results-grid">
              {results.map((p) => (
                <ResultCard key={p._id} product={p} onAnalyze={handleAnalyze} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Built for Hackfinity 🎀 · FairCart by Team Cali · PES University 💜</p>
      </footer>

      {/* Modal */}
      {modalData && (
        <AnalysisModal data={modalData} onClose={() => setModalData(null)} />
      )}
    </div>
  );
}
