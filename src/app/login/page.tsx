"use client";

// ============================================================
// PASzar — Halaman Login Admin
// ============================================================
// Design System: High-End Minimalist (docs/Design_System.md)
//   ✅ rounded-none (tidak ada rounded corners)
//   ✅ border tipis flat (border-stone-200, border-stone-300)
//   ✅ Tidak ada box-shadow
//   ✅ Typography: Playfair Display (heading) + Inter (body)
//   ✅ Palet warna: stone-* scale
// ============================================================

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // Handle redirect secara manual
    });

    if (result?.error) {
      setErrorMessage("Email atau password salah. Silakan coba lagi.");
      setIsLoading(false);
      return;
    }

    // Login berhasil — redirect ke dashboard
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="mb-10 text-center">
          {/* Eyebrow label */}
          <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 font-normal mb-4">
            Koperasi Lapas Kupang
          </p>

          {/* Logo / Brand */}
          <h1
            className="text-4xl font-light text-stone-900"
            style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
          >
            PASzar
          </h1>

          <div className="mt-4 border-b border-stone-200" />

          {/* Sub-label */}
          <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-stone-500 font-normal">
            Admin Dashboard
          </p>
        </div>

        {/* ── Form Card ───────────────────────────────────── */}
        <div className="border border-stone-200 bg-white px-8 py-8">

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] uppercase tracking-[0.15em] text-stone-600 font-normal mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@paszar.com"
                className="w-full px-4 py-3 rounded-none border border-stone-300 text-sm
                           font-light text-stone-900 placeholder:text-stone-400 bg-white
                           focus:outline-none focus:border-stone-900
                           transition-colors duration-200 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] uppercase tracking-[0.15em] text-stone-600 font-normal mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-none border border-stone-300 text-sm
                           font-light text-stone-900 placeholder:text-stone-400 bg-white
                           focus:outline-none focus:border-stone-900
                           transition-colors duration-200 disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-[11px] text-red-600 font-normal leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full py-4 rounded-none border border-stone-900 bg-stone-900
                         text-white text-[11px] uppercase tracking-[0.2em] font-normal
                         hover:bg-stone-800 transition-colors duration-200
                         disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  {/* Spinner minimal */}
                  <span
                    className="w-3.5 h-3.5 border border-white/30 border-t-white
                               rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  Masuk...
                </>
              ) : (
                "Masuk ke Dashboard"
              )}
            </button>
          </form>
        </div>

        {/* ── Footer note ─────────────────────────────────── */}
        <p className="mt-8 text-center text-[10px] text-stone-400 font-normal
                       tracking-[0.1em] leading-relaxed">
          Akses hanya untuk administrator terdaftar.
          <br />
          Hubungi pengelola sistem jika mengalami kendala.
        </p>

      </div>
    </div>
  );
}
