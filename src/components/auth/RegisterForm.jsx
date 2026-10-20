import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

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

  const FieldInput = ({ name, label, type = "text", icon: Icon, placeholder, showToggle, toggleState, onToggle, error }) => (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Icon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
        </div>
        <input
          name={name}
          type={showToggle ? (toggleState ? "text" : "password") : type}
          required
          value={formData[name]}
          onChange={handleChange}
          className="input w-full py-2.5 text-sm"
          style={{
            paddingLeft: "2.75rem",
            paddingRight: showToggle ? "2.75rem" : "1rem",
            ...(error ? { borderColor: "var(--danger)" } : {}),
          }}
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors hover:opacity-100 z-10"
            style={{ color: "var(--text-muted)" }}
            onClick={onToggle}
            tabIndex={-1}
          >
            {toggleState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );

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
          Create account
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Start your distraction-free writing space
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <FieldInput name="name" label="Full name" type="text" icon={User} placeholder="Your name" error={errors.name} />
          <FieldInput name="email" label="Email address" type="email" icon={Mail} placeholder="you@example.com" error={errors.email} />
          <FieldInput
            name="password" label="Password" type="password" icon={Lock} placeholder="••••••••"
            showToggle toggleState={showPassword} onToggle={() => setShowPassword(!showPassword)}
            error={errors.password}
          />
          <FieldInput
            name="confirmPassword" label="Confirm password" type="password" icon={Lock} placeholder="••••••••"
            showToggle toggleState={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-sm font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              <>
                <span>Create account</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-5 text-center" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium transition-colors hover:underline"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
