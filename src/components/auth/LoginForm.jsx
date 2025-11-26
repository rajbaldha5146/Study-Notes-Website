import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, FileText } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { consumePendingShareRedirect } from "../../utils/shareRedirect";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Check for pending share redirect first, then location state, then default to /app
      const pendingShare = consumePendingShareRedirect();
      const redirectTo = location.state?.from?.pathname || pendingShare || "/app";
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-100">Welcome back</h1>
        <p className="text-neutral-500 mt-1">Sign in to your account</p>
      </div>

      {/* Form */}
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Mail className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Lock className="h-4 w-4 text-neutral-500" />
              </div>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-12 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 mt-2"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
