"use client";

// ============================================================
// PASzar — Login Page (Strict Proportion SaaS)
// ============================================================
// Dotted background texture for Enterprise feel
// Deep Navy #0a192f submit button
// Tenun NTT subtle placeholder accent at the top
// Tight typography & spacing for Header
// ============================================================

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Building, AlertCircle,
  ChevronRight, Loader2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setErrorMessage("Email atau password tidak valid.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center p-4">

      {/* ── Main Card (Ramping, Proporsional, & Overflow Hidden untuk Aksen Atas) ── */}
      <div className="w-full max-w-[380px] bg-white rounded-xl border border-slate-200/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] z-10 flex flex-col overflow-hidden">

        {/* ── Motif Tenun Placeholder (Dekoratif Atas) ── */}
        <div 
          className="h-20 w-full bg-gradient-to-r from-slate-200 to-slate-100 opacity-80"
          style={{ 
            backgroundImage: "url('/images/tenun-pattern.png')", 
            backgroundSize: "cover", 
            backgroundPosition: "center" 
          }}
        />

        {/* ── Konten Utama Card ── */}
        <div className="px-8 pb-8 flex flex-col">
          
          {/* ── Header Card (Tighter Spacing & Overlapping Logo) ── */}
          <div className="flex flex-col items-center -mt-8 relative z-20">
            {/* Logo ditarik ke atas agar menimpa aksen motif sedikit (SaaS look) */}
            <div className="w-12 h-12 rounded-lg bg-[#0a192f] flex items-center justify-center text-white shadow-sm ring-4 ring-white">
              <Building size={20} strokeWidth={2.5} />
            </div>

            <div className="flex flex-col items-center mt-3 space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Welcome to PASzar
              </h1>
              <p className="text-sm text-slate-500 font-medium text-center leading-tight">
                Sign in to access your secure admin dashboard.
              </p>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 mt-7">
            
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Enter your email"
                disabled={isLoading}
                className="w-full px-3 h-11 rounded-md bg-white border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-slate-800 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                  Password <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full px-3 h-11 pr-10 rounded-md bg-white border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-slate-800 transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-100 px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <p className="text-xs font-medium text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full mt-2 flex items-center justify-between px-4 h-11 rounded-md text-white text-sm font-medium tracking-wide transition-all duration-200 bg-gradient-to-b from-[#1C2E4A] to-[#141E30] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#233554] hover:to-[#1a2744] active:scale-[0.98] active:from-[#141E30] active:to-[#0d1825] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] disabled:bg-none disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:border disabled:border-slate-200 disabled:cursor-not-allowed"
            >
              <span className="flex-1 text-center pl-4">Sign in</span>
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronRight size={16} className="opacity-70" />
              )}
            </button>
          </form>

          {/* ── Footer (Inside Card) ── */}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              Koperasi Lapas Kupang — Kementerian Imigrasi dan Permasyarakatan
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
