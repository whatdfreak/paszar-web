// Route group (public) — semua halaman storefront dibungkus
// Header, Footer, CartDrawer, CheckoutModal di sini.
// Admin layout di src/app/dashboard punya layoutnya sendiri.

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import Header, { type SearchProductItem } from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CartDrawer from "@/components/public/CartDrawer";
import CheckoutModal from "@/components/public/CheckoutModal";
import LangHydrator from "@/components/public/LangHydrator";
import type { Lang } from "@/stores/langStore";

async function getSearchProducts(): Promise<SearchProductItem[]> {
  try {
    const items = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        image: true,
        category: { select: { name: true } },
      },
    });
    return items.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: p.image,
      category: p.category.name,
    }));
  } catch {
    return [];
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore, searchProducts] = await Promise.all([
    cookies(),
    getSearchProducts(),
  ]);
  const cookieLang = cookieStore.get("paszar_lang")?.value;
  const initialLang: Lang = cookieLang === "en" ? "en" : "id";

  return (
    <LangHydrator initialLang={initialLang}>
      <Header searchProducts={searchProducts} />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Global cart UI — rendered at layout level so they overlay everything */}
      <CartDrawer />
      <CheckoutModal />
    </LangHydrator>
  );
}
