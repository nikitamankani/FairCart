// ─────────────────────────────────────────────────────────────────────────────
// SerpAPI Integration (Google Shopping)
// To enable: set SERP_API_KEY in your .env file
// Get a free key at: https://serpapi.com  (100 free searches/month)
// ─────────────────────────────────────────────────────────────────────────────
const axios = require("axios");

const SERP_API_KEY = process.env.SERP_API_KEY;
const SERP_BASE = "https://serpapi.com/search.json";

/**
 * Search real products from Google Shopping via SerpAPI
 * Falls back to null if API key not set or request fails
 */
async function searchRealProducts(query) {
  if (!SERP_API_KEY) {
    console.log("ℹ️  SERP_API_KEY not set — using mock database");
    return null;
  }

  try {
    const response = await axios.get(SERP_BASE, {
      params: {
        api_key: SERP_API_KEY,
        engine: "google_shopping",
        q: query,
        gl: "in",        // India
        hl: "en",
        num: 20,
      },
      timeout: 8000,
    });

    const items = response.data?.shopping_results || [];

    // Normalize SerpAPI response to our product shape
    return items.map((item, i) => ({
      _id: `serp_${i}_${Date.now()}`,
      name: item.title || "Unknown Product",
      brand: item.source || "Unknown Brand",
      category: detectCategory(item.title),
      gender: detectGenderFromText(item.title),
      price: parsePriceINR(item.price),
      image: item.thumbnail || "",
      keywords: [],
      description: item.snippet || "",
      source: "serpapi",
      productLink: item.link || "",
    }));
  } catch (err) {
    console.error("SerpAPI error:", err.message);
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePriceINR(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[₹,\s$]/g, "").replace(/[^\d.]/g, "");
  return parseFloat(cleaned) || 0;
}

function detectGenderFromText(text = "") {
  const lower = text.toLowerCase();
  const femaleWords = ["women", "woman", "female", "ladies", "girl", "her", "feminine"];
  const maleWords = ["men", "man", "male", "guys", "his", "masculine"];
  if (femaleWords.some((w) => lower.includes(w))) return "female";
  if (maleWords.some((w) => lower.includes(w))) return "male";
  return "neutral";
}

function detectCategory(text = "") {
  const lower = text.toLowerCase();
  if (lower.includes("razor") || lower.includes("shave")) return "razors";
  if (lower.includes("shampoo")) return "shampoo";
  if (lower.includes("deodorant") || lower.includes("deo")) return "deodorant";
  if (lower.includes("body wash") || lower.includes("shower gel")) return "body_wash";
  if (lower.includes("sunscreen") || lower.includes("spf")) return "sunscreen";
  if (lower.includes("vitamin") || lower.includes("supplement")) return "vitamins";
  if (lower.includes("lotion") || lower.includes("moisturizer")) return "skincare";
  return "personal_care";
}

module.exports = { searchRealProducts };
