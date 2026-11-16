"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Eye,
  EyeOff,
  Building,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Package,
  ShoppingBag,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Masukkan format email yang valid.");
      return;
    }
    if (!password) {
      setErrorMessage("Password wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: trimmedEmail,
        password,
        redirect: false,
      });

      if (!result || result.error || !result.ok) {
        setErrorMessage("Email atau password tidak valid.");
        setIsLoading(false);
        return;
      }

      // Hard navigation memastikan cookie session NextAuth langsung terbaca
      // oleh middleware & Server Component tanpa race condition router.refresh()
      window.location.assign("/dashboard");
    } catch {
      setErrorMessage("Gagal terhubung ke server. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Subtle Architectural Dot Texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse 75% 75% at 50% 50%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 75% at 50% 50%, #000 55%, transparent 100%)",
        }}
      />

      {/* Split Card */}
      <div className="relative z-10 w-full max-w-[820px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-soft-enter">
        {/* Left Brand Panel */}
        <div className="md:col-span-5 bg-[#0B1C30] text-white p-7 md:p-8 flex flex-col justify-between relative overflow-hidden">
          {/* Fine Grid Texture inside Dark Panel */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <Building size={16} strokeWidth={2.2} className="text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">PASzar</span>
            </div>

            <div className="mt-7">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Portal Internal
              </p>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                Manajemen Koperasi Warga Binaan
              </h2>
              <p className="text-xs text-slate-300/80 mt-2 leading-relaxed">
                Akses terpusat untuk mengelola katalog produk kerajinan,
                kategori, dan pemrosesan pesanan pelanggan.
              </p>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-slate-200 hidden md:block">
              <li className="flex items-center gap-2.5">
                <Package className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Kontrol stok & katalog real-time</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShoppingBag className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Pemrosesan pesanan & status pengiriman</span>
              </li>
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                <span>Akses terbatas khusus pengelola</span>
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-white/10">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Koperasi Lapas Kupang
              <br />
              Kementerian Imigrasi dan Pemasyarakatan
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-7 sm:p-9 md:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Masuk ke Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan kredensial akun admin Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email Admin
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage("");
                }}
                required
                autoComplete="email"
                placeholder="admin@paszar.id"
                disabled={isLoading}
                className="w-full px-3 h-10 rounded-lg bg-slate-50/70 border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0B1C30] focus:ring-2 focus:ring-[#0B1C30]/15 transition-all disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  required
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  disabled={isLoading}
                  className="w-full px-3 h-10 pr-10 rounded-lg bg-slate-50/70 border border-slate-200 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#0B1C30] focus:ring-2 focus:ring-[#0B1C30]/15 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Lihat password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={15} strokeWidth={2} />
                  ) : (
                    <Eye size={15} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <p className="text-xs font-medium text-rose-700">
                  {errorMessage}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-lg text-white text-xs font-semibold bg-[#0B1C30] hover:bg-[#132944] shadow-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>

          {/* Integrated Storefront Redirect */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-400">Bukan pengelola toko?</span>
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-semibold text-[#0B1C30] hover:underline"
            >
              <span>Ke Etalase Toko</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
