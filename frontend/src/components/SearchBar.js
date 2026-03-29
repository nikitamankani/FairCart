import React, { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  const suggestions = [
    "women's razor",
    "shampoo",
    "deodorant",
    "sunscreen",
    "body wash",
  ];

  return (
    <div className="hero-search">
      {/* background blobs */}
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>

      <div className="hero-content">
        <h1 className="hero-title">
          Find the <span>hidden price bias</span> 💅
        </h1>
        <p className="hero-sub">
          Discover if you're paying more just because it's "for women"
        </p>

        <form onSubmit={handleSubmit} className="search-glass">
          <span>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try 'women's razor' or 'shampoo'..."
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()}>
            {loading ? "✨..." : "Analyze"}
          </button>
        </form>

        <div className="chips">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                onSearch(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
