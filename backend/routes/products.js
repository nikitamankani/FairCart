const express = require("express");
const router = express.Router();
const Product = require("../utils/productModel");
const {
  detectGender,
  stripGenderedKeywords,
  calculateBiasScore,
  findAlternatives,
} = require("../utils/biasEngine");
const { searchRealProducts } = require("../utils/serpApi");

// ── GET /api/products/search?q=women's razor ──────────────────────────────────
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    const detectedGender = detectGender(q, []);
    const neutralQuery = stripGenderedKeywords(q);

    // 1️⃣ Try SerpAPI first (real-time data)
    const liveResults = await searchRealProducts(q);

    if (liveResults && liveResults.length > 0) {
      const enriched = enrichWithBias(liveResults);
      return res.json({
        products: enriched,
        detectedGender,
        neutralQuery,
        source: "live",
      });
    }

    // 2️⃣ Fallback: MongoDB mock dataset
    let products = await Product.find({
      $or: [
        { name: { $regex: neutralQuery, $options: "i" } },
        { brand: { $regex: neutralQuery, $options: "i" } },
        { category: { $regex: neutralQuery, $options: "i" } },
        { keywords: { $in: [q.toLowerCase()] } },
      ],
    }).limit(20);

    if (products.length === 0) {
      return res.json({ products: [], detectedGender, message: "No products found", source: "mock" });
    }

    const enriched = products.map((product) => {
      const p = product.toObject();
      const sameCategory = products.filter(
        (x) => x.category === p.category && x._id.toString() !== p._id.toString() && x.gender !== p.gender
      );
      const alternative = sameCategory.sort((a, b) => a.price - b.price)[0];
      let bias = null;
      if (p.gender === "female" && alternative) {
        bias = calculateBiasScore(p.price, alternative.price);
      } else if (p.gender === "male" && alternative) {
        bias = calculateBiasScore(alternative.price, p.price);
        if (bias) bias.reversed = true;
      }
      return { ...p, bias };
    });

    res.json({ products: enriched, detectedGender, neutralQuery, source: "mock" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/analyze/:id ─────────────────────────────────────────────
// Supports both MongoDB IDs and SerpAPI inline analysis
router.get("/analyze/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // SerpAPI product — id won't be a valid MongoDB ObjectId
    // Client should use POST /analyze-live instead
    if (!id.match(/^[a-f\d]{24}$/i)) {
      return res.status(400).json({ error: "Use POST /api/products/analyze-live for live products" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const allInCategory = await Product.find({ category: product.category });
    const alternatives = findAlternatives(product.toObject(), allInCategory);

    let biasScore = null;
    if (product.gender === "female" && alternatives.length > 0) {
      biasScore = calculateBiasScore(product.price, alternatives[0].price);
    }

    res.json({
      product: product.toObject(),
      alternatives,
      biasScore,
      categoryAvgFemale: await getCategoryAvg(product.category, "female"),
      categoryAvgMale: await getCategoryAvg(product.category, "male"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/products/analyze-live ──────────────────────────────────────────
// Full analysis for SerpAPI products (pass the full product + all results)
router.post("/analyze-live", async (req, res) => {
  try {
    const { product, allProducts } = req.body;
    if (!product) return res.status(400).json({ error: "product required" });

    const products = allProducts || [];

    // Find alternatives from the same search results
    const alternatives = products
      .filter(
        (p) =>
          p.category === product.category &&
          p._id !== product._id &&
          (p.gender === "male" || p.gender === "neutral") &&
          p.price <= product.price * 1.5
      )
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    let biasScore = null;
    if (product.gender === "female" && alternatives.length > 0) {
      biasScore = calculateBiasScore(product.price, alternatives[0].price);
    }

    // Category averages from live results
    const femaleProds = products.filter((p) => p.gender === "female" && p.category === product.category);
    const maleProds = products.filter((p) => p.gender === "male" && p.category === product.category);
    const categoryAvgFemale = femaleProds.length
      ? femaleProds.reduce((s, p) => s + p.price, 0) / femaleProds.length
      : null;
    const categoryAvgMale = maleProds.length
      ? maleProds.reduce((s, p) => s + p.price, 0) / maleProds.length
      : null;

    res.json({ product, alternatives, biasScore, categoryAvgFemale, categoryAvgMale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/categories ──────────────────────────────────────────────
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/stats ───────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const stats = [];
    for (const cat of categories) {
      const femaleProducts = await Product.find({ category: cat, gender: "female" });
      const maleProducts = await Product.find({ category: cat, gender: "male" });
      if (femaleProducts.length && maleProducts.length) {
        const avgFemale = femaleProducts.reduce((s, p) => s + p.price, 0) / femaleProducts.length;
        const avgMale = maleProducts.reduce((s, p) => s + p.price, 0) / maleProducts.length;
        const bias = calculateBiasScore(avgFemale, avgMale);
        stats.push({ category: cat, avgFemale, avgMale, bias });
      }
    }
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getCategoryAvg(category, gender) {
  const products = await Product.find({ category, gender });
  if (!products.length) return null;
  return products.reduce((s, p) => s + p.price, 0) / products.length;
}

function enrichWithBias(products) {
  return products.map((p) => {
    const sameCategory = products.filter(
      (x) => x.category === p.category && x._id !== p._id && x.gender !== p.gender
    );
    const alternative = sameCategory.sort((a, b) => a.price - b.price)[0];
    let bias = null;
    if (p.gender === "female" && alternative) {
      bias = calculateBiasScore(p.price, alternative.price);
    } else if (p.gender === "male" && alternative) {
      bias = calculateBiasScore(alternative.price, p.price);
      if (bias) bias.reversed = true;
    }
    return { ...p, bias };
  });
}

module.exports = router;