const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../utils/userModel");
const { protect } = require("../middleware/auth");

// ── Helper: generate JWT ──────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Please fill in all fields" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created! Welcome to FairCart 🎀",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Please enter email and password" });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid email or password" });

    const token = generateToken(user._id);

    res.json({
      message: `Welcome back, ${user.name}! 💜`,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

// ── POST /api/auth/save-product ───────────────────────────────────────────────
router.post("/save-product", protect, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ error: "productId required" });

    const user = await User.findById(req.user._id);

    // Toggle: remove if already saved
    const alreadySaved = user.savedProducts.find(
      (s) => s.productId?.toString() === productId
    );

    if (alreadySaved) {
      user.savedProducts = user.savedProducts.filter(
        (s) => s.productId?.toString() !== productId
      );
      await user.save();
      return res.json({ saved: false, message: "Removed from favourites" });
    }

    user.savedProducts.push({ productId });
    await user.save();
    res.json({ saved: true, message: "Saved to favourites 🎀" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/auth/saved-products ──────────────────────────────────────────────
router.get("/saved-products", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "savedProducts.productId"
    );
    const products = user.savedProducts
      .map((s) => s.productId)
      .filter(Boolean);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
