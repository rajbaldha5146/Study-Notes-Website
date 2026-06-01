import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { consumePendingShareRedirect } from "../../utils/shareRedirect";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const pendingShare = consumePendingShareRedirect();
      const redirectTo = location.state?.from?.pathname || pendingShare || "/app";
      setTimeout(() => navigate(redirectTo, { replace: true }), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto" style={{ animation: "fade-up 0.4s ease both" }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 relative"
          style={{
            background: "linear-gradient(135deg, #6d28d9, #8b5cf6, #06b6d4)",
            boxShadow: "0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(6,182,212,0.15)",
          }}
        >
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold mb-1" style={{ letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sign in to your vault</p>
      </div>

      {/* Card */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.06)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: "rgba(26, 37, 64, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                placeholder="you@example.com"
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--violet)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-subtle)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: "rgba(26, 37, 64, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--violet)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-subtle)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "var(--text-muted)" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm"
          >
            {loading ? (
              <><div className="spinner" /> Signing in...</>
            ) : (
              <><span>Sign in</span><ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold transition-colors hover:opacity-80" style={{ color: "var(--violet-light)" }}>
              Sign up free
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
