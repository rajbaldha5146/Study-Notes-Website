import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
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
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img
            src="/logo.png"
            alt="NoteMaster"
            className="w-12 h-12 rounded-xl object-cover shadow-md"
          />
        </div>
        <h1
          className="font-serif text-2xl font-normal tracking-tight mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome back
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Sign in to your notebook
        </p>
      </div>

      {/* Card */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              Email address
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Mail className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input w-full py-2.5 text-sm"
                style={{ paddingLeft: "2.75rem", paddingRight: "1rem" }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Lock className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="input w-full py-2.5 text-sm"
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-100 z-10"
                style={{ color: "var(--text-muted)" }}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-sm font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium transition-colors hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign up free
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
