import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../../services/authService";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      navigate("/");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password && !isLoading;

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent mb-2">
            MeetingAI
          </h1>
          <p className="text-blue-200/60 text-sm">Welcome back to your workspace</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-blue-500/20">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors disabled:opacity-50"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 bg-slate-700 border border-slate-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                Remember me
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full mt-6 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:shadow-none active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-linear-to-r from-slate-700 to-transparent" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-linear-to-l from-slate-700 to-transparent" />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="text-slate-400 hover:text-slate-300 underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </div>
  );
}