import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../../services/authService";
import { Eye, EyeOff, Mail, Lock, User, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Please enter your name";
    if (!formData.email.includes("@")) return "Please enter a valid email";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!agreeToTerms) return "You must agree to the terms and conditions";
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    agreeToTerms &&
    !isLoading;

  const passwordMatch = formData.password === formData.confirmPassword && formData.password;
  const passwordStrong = formData.password.length >= 8;

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/50">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-purple-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-2">
            MeetingAI
          </h1>
          <p className="text-purple-200/60 text-sm">Join thousands of teams using intelligent meeting insights</p>
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-purple-500/20 text-center animate-fadeIn">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-100 mb-2">Welcome!</h2>
            <p className="text-slate-400 mb-6">Your account has been created successfully. Redirecting to login...</p>
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-linear-to-r from-purple-500 to-blue-500 animate-pulse" />
            </div>
          </div>
        )}

        {/* Form Card */}
        {!success && (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-purple-500/20">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordStrong ? "bg-emerald-500" : "bg-slate-700"
                  }`} />
                  <span className="text-xs text-slate-400">
                    {formData.password.length === 0 ? "0" : formData.password.length}+ chars
                  </span>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors disabled:opacity-50"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <p className={`text-xs ${passwordMatch ? "text-emerald-400" : "text-red-400"}`}>
                    {passwordMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50 mt-1"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  I agree to the{" "}
                  <Link to="/terms" className="text-purple-400 hover:text-purple-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-purple-400 hover:text-purple-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full mt-6 px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:shadow-none active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}