const express = require("express");
const router = express.Router();
const Product = require("../utils/productModel");
const {
  detectGender,
  stripGenderedKeywords,
  calculateBiasScore,
  findAlternatives,
} = require("../utils/biasEngine");

// GET /api/products/search?q=women's razor
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    const detectedGender = detectGender(q, []);
    const neutralQuery = stripGenderedKeywords(q);

    // Search by text or partial name match
    let products = await Product.find({
      $or: [
        { name: { $regex: neutralQuery, $options: "i" } },
        { brand: { $regex: neutralQuery, $options: "i" } },
        { category: { $regex: neutralQuery, $options: "i" } },
        { keywords: { $in: [q.toLowerCase()] } },
      ],
    }).limit(20);

    if (products.length === 0) {
      return res.json({ products: [], detectedGender, message: "No products found" });
    }

    // Enrich each product with bias score
    const enriched = products.map((product) => {
      const p = product.toObject();
      // Find the cheapest alternative in same category different gender
      const sameCategory = products.filter(
        (x) =>
          x.category === p.category &&
          x._id.toString() !== p._id.toString() &&
          x.gender !== p.gender
      );
      const alternative = sameCategory.sort((a, b) => a.price - b.price)[0];

      let bias = null;
      if (p.gender === "female" && alternative) {
        bias = calculateBiasScore(p.price, alternative.price);
      } else if (p.gender === "male" && alternative) {
        bias = calculateBiasScore(alternative.price, p.price);
        if (bias) bias.reversed = true; // female priced lower than male
      }

      return { ...p, bias };
    });

    res.json({ products: enriched, detectedGender, neutralQuery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/analyze/:id - full bias analysis for a product
router.get("/analyze/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
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

// GET /api/products/categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/stats - platform-wide stats
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

async function getCategoryAvg(category, gender) {
  const products = await Product.find({ category, gender });
  if (!products.length) return null;
  return products.reduce((s, p) => s + p.price, 0) / products.length;
}

module.exports = router;