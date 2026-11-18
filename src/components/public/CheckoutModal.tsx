// ============================================================
// PASzar — CheckoutModal (Honeypot, Strict Client Validation & Server WA URL)
// ============================================================

"use client";

import { useState } from "react";
import { useCartStore, cartSubtotal } from "@/stores/cartStore";

type CheckoutStep = 1 | 2;

interface FormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerProvince: string;
  customerPostalCode: string;
  notes: string;
  _honeypot: string;
}

const EMPTY_FORM: FormData = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerCity: "",
  customerProvince: "",
  customerPostalCode: "",
  notes: "",
  _honeypot: "",
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function validateCheckoutForm(form: FormData): string | null {
  if (form._honeypot.trim().length > 0) {
    return "Permintaan tidak valid.";
  }
  const name = form.customerName.trim();
  if (name.length < 2 || name.length > 100) {
    return "Nama lengkap minimal 2 karakter (maksimal 100).";
  }
  const phone = form.customerPhone.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  if (
    !/^[0-9+\-\s()]+$/.test(phone) ||
    phoneDigits.length < 8 ||
    phone.length > 20
  ) {
    return "Nomor HP / WhatsApp tidak valid (minimal 8 digit).";
  }
  const addr = form.customerAddress.trim();
  if (addr.length < 5 || addr.length > 500) {
    return "Alamat lengkap minimal 5 karakter (maksimal 500).";
  }
  const city = form.customerCity.trim();
  if (city.length < 2 || city.length > 100) {
    return "Kota / Kabupaten wajib diisi (minimal 2 karakter).";
  }
  const prov = form.customerProvince.trim();
  if (prov.length < 2 || prov.length > 100) {
    return "Provinsi wajib diisi (minimal 2 karakter).";
  }
  const postal = form.customerPostalCode.trim();
  if (!/^\d{5,10}$/.test(postal)) {
    return "Kode pos harus terdiri dari 5–10 digit angka.";
  }
  if (form.notes.trim().length > 500) {
    return "Catatan maksimal 500 karakter.";
  }
  return null;
}

const inputClass =
  "w-full px-4 py-3 border border-stone-300 text-sm font-light text-stone-900 placeholder:text-stone-300 focus:outline-none focus:border-stone-900 transition-colors";

export default function CheckoutModal() {
  const isCheckoutOpen = useCartStore((s) => s.isCheckoutOpen);
  const closeCheckout = useCartStore((s) => s.closeCheckout);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore(cartSubtotal);

  const [step, setStep] = useState<CheckoutStep>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [waUrl, setWaUrl] = useState<string | null>(null);

  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36)
  );

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    closeCheckout();
    setTimeout(() => {
      setStep(1);
      setForm(EMPTY_FORM);
      setError(null);
      setOrderCode(null);
      setWaUrl(null);
    }, 300);
  };

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loading) return;

    if (items.length === 0) {
      setError("Keranjang Anda kosong.");
      return;
    }

    const validationError = validateCheckoutForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerAddress: form.customerAddress.trim(),
        customerCity: form.customerCity.trim(),
        customerProvince: form.customerProvince.trim(),
        customerPostalCode: form.customerPostalCode.trim(),
        notes: form.notes.trim() || undefined,
        _honeypot: form._honeypot,
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          productPrice: i.price,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        success: boolean;
        orderCode?: string;
        waUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.success || !data.orderCode) {
        setError(data.error ?? "Terjadi kesalahan. Coba lagi.");
        return;
      }

      const safeWaUrl =
        data.waUrl && /^https:\/\/wa\.me\/\d+/i.test(data.waUrl)
          ? data.waUrl
          : null;

      setOrderCode(data.orderCode);
      setWaUrl(safeWaUrl);
      clearCart();
      setStep(2);
    } catch {
      setError("Koneksi gagal. Periksa internet Anda dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up border border-stone-200">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-8 py-6 border-b border-stone-200">
          <h2 className="text-[11px] uppercase tracking-[0.2em] text-stone-900 font-normal">
            {step === 2 ? "Pesanan Dikonfirmasi" : "Checkout"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-900 transition-colors"
            aria-label="Tutup checkout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-8 py-8">
          {/* ── Step 1: Data Pengiriman ────────────────────── */}
          {step === 1 && (
            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              {/* Honeypot anti-bot field (wajib kosong) */}
              <input
                type="text"
                name="_honeypot"
                value={form._honeypot}
                onChange={handleField}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              {/* Order Summary */}
              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-4">
                  Ringkasan Pesanan
                </p>
                <div className="space-y-2 mb-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-stone-600 font-light truncate mr-4">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-stone-900 font-normal shrink-0">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 border-t border-stone-200">
                  <span className="text-sm text-stone-500">Total</span>
                  <span className="text-base text-stone-900 font-normal">{formatRupiah(subtotal)}</span>
                </div>
              </div>

              {/* Shipping Form */}
              <p className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-normal mb-5">
                Data Pengiriman
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] text-stone-500 font-light mb-1.5">Nama Lengkap</label>
                  <input name="customerName" value={form.customerName} onChange={handleField} type="text" maxLength={100} required placeholder="Nama penerima" className={inputClass} style={{ borderRadius: 0 }} />
                </div>
                <div>
                  <label className="block text-[12px] text-stone-500 font-light mb-1.5">Nomor HP / WhatsApp</label>
                  <input name="customerPhone" value={form.customerPhone} onChange={handleField} type="tel" maxLength={20} required placeholder="+62..." className={inputClass} style={{ borderRadius: 0 }} />
                </div>
                <div>
                  <label className="block text-[12px] text-stone-500 font-light mb-1.5">Alamat Lengkap</label>
                  <input name="customerAddress" value={form.customerAddress} onChange={handleField} type="text" maxLength={500} required placeholder="Jalan, RT/RW, Kelurahan" className={inputClass} style={{ borderRadius: 0 }} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] text-stone-500 font-light mb-1.5">Kota</label>
                    <input name="customerCity" value={form.customerCity} onChange={handleField} type="text" maxLength={100} required placeholder="Kota / Kabupaten" className={inputClass} style={{ borderRadius: 0 }} />
                  </div>
                  <div>
                    <label className="block text-[12px] text-stone-500 font-light mb-1.5">Provinsi</label>
                    <input name="customerProvince" value={form.customerProvince} onChange={handleField} type="text" maxLength={100} required placeholder="Provinsi" className={inputClass} style={{ borderRadius: 0 }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] text-stone-500 font-light mb-1.5">Kode Pos</label>
                  <input name="customerPostalCode" value={form.customerPostalCode} onChange={handleField} type="text" inputMode="numeric" maxLength={10} required placeholder="85xxx" className={inputClass} style={{ borderRadius: 0 }} />
                </div>
                <div>
                  <label className="block text-[12px] text-stone-500 font-light mb-1.5">Catatan (opsional)</label>
                  <input name="notes" value={form.notes} onChange={handleField} type="text" maxLength={500} placeholder="Instruksi khusus pengiriman" className={inputClass} style={{ borderRadius: 0 }} />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-[12px] text-red-600 font-light">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 py-4 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Memproses..." : "Konfirmasi & Buat Pesanan"}
              </button>
            </form>
          )}

          {/* ── Step 2: Konfirmasi & WA Redirect ─────────── */}
          {step === 2 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 border-2 border-stone-900 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-stone-900" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3
                className="text-xl font-light text-stone-900 mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Pesanan Berhasil Dibuat
              </h3>
              <p className="text-sm text-stone-400 font-light mb-2">
                Kode pesanan Anda:
              </p>
              <p className="text-base font-normal text-stone-900 tracking-widest mb-6">
                {orderCode}
              </p>
              <p className="text-sm text-stone-400 font-light mb-8 max-w-xs mx-auto">
                Klik tombol di bawah untuk mengirim detail pesanan ke admin kami via WhatsApp dan konfirmasi pembayaran.
              </p>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full py-4 bg-stone-900 text-white text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-800 transition-colors duration-200 text-center mb-4"
                >
                  Kirim via WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-light border-b border-stone-300 pb-0.5 hover:text-stone-900 transition-colors"
              >
                Lanjut Belanja
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
