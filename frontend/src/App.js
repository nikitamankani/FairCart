import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import ResultCard from "./components/ResultCard";
import AnalysisModal from "./components/AnalysisModal";
import StatsBar from "./components/StatsBar";
import AuthPage from "./components/AuthPage";
import SavedProductsModal from "./components/SavedProductsModal";
import { useAuth } from "./context/AuthContext";
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

const STAT_CARDS = [
  { emoji: "💰", title: "Extra Annual Spend",   stat: "₹15,000+", sub: "per woman on pink-taxed products",         color: "#ffc2dc", border: "#ff94c2" },
  { emoji: "🛒", title: "Categories Affected",  stat: "42+",      sub: "product categories with gendered pricing",  color: "#e9c8ff", border: "#c77dff" },
  { emoji: "✂️", title: "Razors Markup",         stat: "+13%",     sub: "women's vs identical men's product",        color: "#ffd6e7", border: "#ff80b5" },
  { emoji: "🧴", title: "Shampoo Tax",           stat: "+11%",     sub: "same formula, different price tag",         color: "#fff0c2", border: "#ffb347" },
  { emoji: "🧼", title: "Skincare Bias",         stat: "+9%",      sub: "women's skincare vs gender-neutral",        color: "#c8f0e9", border: "#5ec4b0" },
  { emoji: "🧴", title: "Deodorant Gap",         stat: "+8%",      sub: "women's deodorant premium",                 color: "#ffc2dc", border: "#ff94c2" },
];

const FACT_ROWS = [
  { icon: "📌", text: "The pink tax is not a government tax — it's a pricing bias by manufacturers and retailers." },
  { icon: "📌", text: "Women in India spend an estimated ₹10,000–₹20,000 extra per year due to gendered pricing." },
  { icon: "📌", text: "Products marketed to women are often chemically identical to men's versions — just repackaged." },
  { icon: "📌", text: "FairCart uses AI to strip gendered keywords and find truly equivalent alternatives for you." },
];

export default function App() {
  const { user, logout } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState(null);
  const [searched, setSearched] = useState(false);
  const [detectedGender, setDetectedGender] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSearch = async (query) => {
    setLoading(true); setError(""); setResults([]); setSearched(true);
    try {
      const res = await searchProducts(query);
      setResults(res.data.products || []);
      setDetectedGender(res.data.detectedGender);
    } catch (err) {
      setError("Failed to fetch products. Make sure the backend is running.");
    } finally { setLoading(false); }
  };

  // ── KEY FIX: pass full product object for live (serp_) products ──
const handleAnalyze = async (id, productObj) => {
  // Live product — build analysis locally, no backend call needed
  if (String(id).startsWith("serp_")) {
    setModalData({
      product: productObj,
      alternatives: results.filter(
        (p) => p.category === productObj.category &&
               p._id !== productObj._id &&
               (p.gender === "male" || p.gender === "neutral") &&
               p.price <= productObj.price
      ).slice(0, 3),
      biasScore: productObj.bias || null,
      categoryAvgFemale: null,
      categoryAvgMale: null,
    });
    return;
  }
  // Mock product — hit backend as normal
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

      {/* ── Header ── */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">FairCart</span>
          <span className="logo-sub">Pink Tax Detector</span>
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <button className="header-btn saved-btn" onClick={() => setShowSaved(true)}>💜 Saved</button>
              <div className="user-pill">
                <span className="user-avatar">{user.name?.[0]?.toUpperCase() || "U"}</span>
                <span className="user-name">{user.name}</span>
                <button className="logout-btn" onClick={logout}>Log out</button>
              </div>
            </>
          ) : (
            <>
              <button className="header-btn login-btn" onClick={() => setShowAuth(true)}>Log in</button>
              <button className="header-btn signup-btn" onClick={() => setShowAuth(true)}>Sign up free 🌸</button>
            </>
          )}
        </div>
      </header>

      <main className="main">

        {/* ── Search Hero ── */}
        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* ── Marquee ── */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {allMarquee.map((item, i) => (
              <span className="marquee-item" key={i}>
                {item.icon} {item.text}<span className="marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* ── Pre-search landing content ── */}
        {!searched && (
          <div className="landing-content">
            <section className="landing-section">
              <div className="section-label">📊 By the numbers</div>
              <div className="stat-cards-grid">
                {STAT_CARDS.map((c, i) => (
                  <div className="stat-card-grid-item" key={i}
                    style={{ "--card-color": c.color, "--card-border": c.border }}>
                    <span className="scg-emoji">{c.emoji}</span>
                    <div className="scg-stat">{c.stat}</div>
                    <div className="scg-title">{c.title}</div>
                    <div className="scg-sub">{c.sub}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="sticker-banner">
              <div className="sticker"><span className="sticker-emoji">🎀</span> Pink Tax is real</div>
              <div className="sticker"><span className="sticker-emoji">📉</span> Save up to ₹20K/yr</div>
              <div className="sticker"><span className="sticker-emoji">🔍</span> AI-Powered Detection</div>
              <div className="sticker"><span className="sticker-emoji">💜</span> Free to use</div>
              <div className="sticker"><span className="sticker-emoji">🛡️</span> Data-backed scores</div>
              <div className="sticker"><span className="sticker-emoji">⚡</span> Real-time results</div>
            </div>

            <section className="landing-section">
              <div className="section-label">💡 Did you know?</div>
              <div className="fact-strip">
                {FACT_ROWS.map((f, i) => (
                  <div className="fact-card" key={i}>
                    <span className="fact-icon">{f.icon}</span>
                    <p className="fact-text">{f.text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="landing-section">
              <div className="section-label">✨ How it works</div>
              <div className="how-grid">
                {[
                  { step: "1", emoji: "🔍", title: "Search a product", desc: "Type any personal care product — 'women's shampoo', 'razor', 'deodorant'" },
                  { step: "2", emoji: "🤖", title: "AI strips the bias", desc: "Our engine removes gendered keywords and finds identical alternatives" },
                  { step: "3", emoji: "📊", title: "Get a Bias Score", desc: "See exactly how much extra you're paying — Fair, Low, Moderate or High" },
                  { step: "4", emoji: "💚", title: "Choose fairly", desc: "Pick from suggested alternatives and save money every single month" },
                ].map((s) => (
                  <div className="how-card" key={s.step}>
                    <div className="how-step">{s.step}</div>
                    <div className="how-emoji">{s.emoji}</div>
                    <div className="how-title">{s.title}</div>
                    <div className="how-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        <StatsBar />

        {error && <div className="error-banner">⚠️ {error}</div>}

        {loading && (
          <div className="loading-state">
            <div className="loading-ring" />
            <p>Analyzing gendered pricing... 🌸</p>
          </div>
        )}

        {searched && !loading && results.length === 0 && !error && (
          <div className="empty-state"><span>🔍</span><p>No products found. Try a different search!</p></div>
        )}

        {results.length > 0 && (
          <>
            <div className="results-header">
              <h2 className="results-title">
                {results.length} product{results.length > 1 ? "s" : ""} found
                {detectedGender && detectedGender !== "neutral" && (
                  <span className="gender-detected">· Detected: <strong>{detectedGender}</strong> product</span>
                )}
              </h2>
              {!user && (
                <button className="save-prompt" onClick={() => setShowAuth(true)}>
                  🤍 Log in to save favourites
                </button>
              )}
            </div>
            <div className="results-grid">
              {results.map((p) => (
                <ResultCard
                  key={p._id}
                  product={p}
                  onAnalyze={(id) => handleAnalyze(id, p)}
                  onAuthRequired={() => setShowAuth(true)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Built for Hackfinity 🎀 · FairCart by Team Cali · PES University 💜</p>
      </footer>

      {modalData && <AnalysisModal data={modalData} onClose={() => setModalData(null)} />}
      {showAuth && <AuthPage onClose={() => setShowAuth(false)} />}
      {showSaved && <SavedProductsModal onClose={() => setShowSaved(false)} />}
    </div>
  );
}