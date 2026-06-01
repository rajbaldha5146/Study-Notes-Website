import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const inputBase = {
  background: "rgba(26, 37, 64, 0.6)",
  border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)",
  outline: "none",
};

const RegisterForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    const result = await register(formData.name, formData.email, formData.password);
    if (result.success) onSuccess?.(formData.email);
    setLoading(false);
  };

  const FieldInput = ({ name, type = "text", icon: Icon, placeholder, showToggle, toggleState, onToggle, error }) => (
    <div>
      <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {name.charAt(0).toUpperCase() + name.replace(/([A-Z])/g, " $1").slice(1)}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </div>
        <input
          name={name}
          type={showToggle ? (toggleState ? "text" : "password") : type}
          required
          value={formData[name]}
          onChange={handleChange}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200"
          style={{
            ...inputBase,
            ...(error ? { borderColor: "rgba(244,63,94,0.5)", boxShadow: "0 0 0 2px rgba(244,63,94,0.1)" } : {}),
            paddingRight: showToggle ? "3rem" : "1rem",
          }}
          placeholder={placeholder}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = "var(--violet)";
              e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)";
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = "var(--border-subtle)";
              e.target.style.boxShadow = "none";
            }
          }}
        />
        {showToggle && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onClick={onToggle}
          >
            {toggleState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs" style={{ color: "#fb7185" }}>{error}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-sm mx-auto" style={{ animation: "fade-up 0.4s ease both" }}>
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: "linear-gradient(135deg, #6d28d9, #8b5cf6, #06b6d4)",
            boxShadow: "0 0 30px rgba(139,92,246,0.4), 0 0 60px rgba(6,182,212,0.15)",
          }}
        >
          <BookOpen className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold mb-1" style={{ letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
          Create account
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Get started for free</p>
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
          <FieldInput name="name" type="text" icon={User} placeholder="Your name" error={errors.name} />
          <FieldInput name="email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email} />
          <FieldInput
            name="password" type="password" icon={Lock} placeholder="••••••••"
            showToggle toggleState={showPassword} onToggle={() => setShowPassword(!showPassword)}
            error={errors.password}
          />
          <FieldInput
            name="confirmPassword" type="password" icon={Lock} placeholder="••••••••"
            showToggle toggleState={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm"
          >
            {loading ? (
              <><div className="spinner" /> Creating account...</>
            ) : (
              <><span>Create account</span><ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold transition-colors hover:opacity-80" style={{ color: "var(--violet-light)" }}>
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
