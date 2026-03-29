import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let data;
      if (mode === "login") {
        data = await login(form.email, form.password);
      } else {
        data = await register(form.name, form.email, form.password);
      }
      setSuccess(data.message);
      setTimeout(() => onClose?.(), 900);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong 😢");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setError("");
    setSuccess("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        {/* Decorative blobs */}
        <div className="auth-blob auth-blob1" />
        <div className="auth-blob auth-blob2" />

        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Left panel — branding */}
        <div className="auth-left">
          <div className="auth-brand">
            <span className="auth-logo-icon">🛒</span>
            <span className="auth-logo-text">FairCart</span>
          </div>
          <h2 className="auth-left-title">
            Know what you <em>actually</em> pay.
          </h2>
          <p className="auth-left-sub">
            Save favourites, track the pink tax, and demand fair pricing — all
            in one place.
          </p>

          <div className="auth-perks">
            {[
              { icon: "🎀", text: "Save favourite products" },
              { icon: "📊", text: "Track your pink tax exposure" },
              { icon: "💸", text: "See how much you overpay per year" },
              { icon: "✨", text: "Get fairer alternatives instantly" },
            ].map((p) => (
              <div className="auth-perk" key={p.text}>
                <span>{p.icon}</span>
                <span>{p.text}</span>
              </div>
            ))}
          </div>

          {/* Cute sticker */}
          <div className="auth-sticker">
            💜 Built for Hackfinity · Team Cali
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-right">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => mode !== "login" && switchMode()}
            >
              Log in
            </button>
            <button
              className={`auth-tab ${mode === "signup" ? "active" : ""}`}
              onClick={() => mode !== "signup" && switchMode()}
            >
              Sign up
            </button>
          </div>

          <div className="auth-form-header">
            <h3 className="auth-form-title">
              {mode === "login" ? "Welcome back 💕" : "Join FairCart 🌸"}
            </h3>
            <p className="auth-form-sub">
              {mode === "login"
                ? "Log in to see your saved products"
                : "Create a free account in seconds"}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="auth-field">
                <label>Your name</label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. Neha ✨"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder={mode === "signup" ? "min. 6 characters" : "••••••••"}
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                <span>🎉</span> {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner" />
              ) : mode === "login" ? (
                "Log in →"
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account?" : "Already a member?"}{" "}
            <button onClick={switchMode}>
              {mode === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
