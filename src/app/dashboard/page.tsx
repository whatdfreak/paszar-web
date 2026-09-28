// ============================================================
// PASzar — Dashboard Utama (Server Component)
// ============================================================
// Menampilkan statistik ringkas: produk, kategori, pesanan.
// Data di-fetch langsung di Server Component (no useEffect).
// Auth di-verifikasi via getServerSession — redirect jika invalid.
// ============================================================

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Package, Tags, ShoppingBag, TrendingUp } from "lucide-react";

// ── Tipe untuk Stat Card ─────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

// ── Komponen Stat Card ───────────────────────────────────────
function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="border border-stone-200 bg-white px-6 py-6 flex flex-col gap-4">
      {/* Header baris: label + icon */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-normal">
          {label}
        </p>
        <div className="p-2 bg-stone-100">
          <Icon size={14} strokeWidth={1.5} className="text-stone-500" />
        </div>
      </div>

      {/* Angka utama */}
      <p
        className="text-4xl font-light text-stone-900 leading-none"
        style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
      >
        {value.toLocaleString("id-ID")}
      </p>

      {/* Deskripsi */}
      <p className="text-[11px] text-stone-400 font-normal leading-relaxed border-t border-stone-100 pt-4">
        {description}
      </p>
    </div>
  );
}

// ── Halaman Dashboard ────────────────────────────────────────
export default async function DashboardPage() {
  // Verifikasi session — redirect jika tidak login
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // Fetch data statistik secara paralel
  const [productCount, categoryCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

  // Fetch pesanan terbaru (5 terakhir)
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderCode: true,
      customerName: true,
      totalAmount: true,
      status: true,
      createdAt: true,
    },
  });

  // Map warna status badge
  const statusStyle: Record<string, string> = {
    PENDING:    "bg-amber-50 text-amber-700 border-amber-200",
    CONFIRMED:  "bg-blue-50 text-blue-700 border-blue-200",
    PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
    SHIPPED:    "bg-indigo-50 text-indigo-700 border-indigo-200",
    COMPLETED:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED:  "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabel: Record<string, string> = {
    PENDING:    "Menunggu",
    CONFIRMED:  "Dikonfirmasi",
    PROCESSING: "Diproses",
    SHIPPED:    "Dikirim",
    COMPLETED:  "Selesai",
    CANCELLED:  "Dibatalkan",
  };

  return (
    <div className="px-6 py-8 max-w-5xl">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 font-normal mb-2">
          Admin Dashboard
        </p>
        <h1
          className="text-2xl font-light text-stone-900"
          style={{ fontFamily: "var(--font-display, 'Georgia', serif)" }}
        >
          Selamat datang, {session.user.name}
        </h1>
        <p className="mt-1 text-sm text-stone-400 font-light">
          Ringkasan aktivitas toko hari ini.
        </p>
      </div>

      {/* ── Stat Cards Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Produk"
          value={productCount}
          icon={Package}
          description="Produk aktif yang terdaftar di katalog PASzar."
        />
        <StatCard
          label="Total Kategori"
          value={categoryCount}
          icon={Tags}
          description="Kategori yang mengorganisir produk di katalog."
        />
        <StatCard
          label="Total Pesanan"
          value={orderCount}
          icon={ShoppingBag}
          description="Seluruh pesanan yang masuk sejak toko dibuka."
        />
      </div>

      {/* ── Pesanan Terbaru ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp size={14} strokeWidth={1.5} className="text-stone-400" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-normal">
            Pesanan Terbaru
          </p>
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-stone-200 px-6 py-12 text-center">
            <p className="text-sm text-stone-400 font-light">
              Belum ada pesanan yang masuk.
            </p>
          </div>
        ) : (
          <div className="border border-stone-200 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 px-5 py-3 bg-stone-50 border-b border-stone-200">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-normal">
                Kode Pesanan
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-normal">
                Pelanggan
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-normal text-right">
                Total
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-normal text-right">
                Status
              </p>
            </div>

            {/* Table rows */}
            {recentOrders.map((order, index) => (
              <div
                key={order.id}
                className={`grid grid-cols-4 px-5 py-4 items-center
                  ${index < recentOrders.length - 1 ? "border-b border-stone-100" : ""}
                  hover:bg-stone-50 transition-colors duration-100`}
              >
                <p className="text-xs font-mono text-stone-700 font-normal">
                  {order.orderCode}
                </p>
                <p className="text-xs text-stone-600 font-light truncate pr-2">
                  {order.customerName}
                </p>
                <p className="text-xs text-stone-700 font-normal text-right">
                  Rp{order.totalAmount.toLocaleString("id-ID")}
                </p>
                <div className="flex justify-end">
                  <span
                    className={`text-[10px] px-2 py-1 border font-normal tracking-[0.05em]
                      ${statusStyle[order.status] ?? "bg-stone-50 text-stone-500 border-stone-200"}`}
                  >
                    {statusLabel[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
