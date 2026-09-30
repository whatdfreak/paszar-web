// Route group (public) — semua halaman storefront dibungkus
// Header, Footer, CartDrawer, CheckoutModal di sini.
// Admin layout di src/app/dashboard punya layoutnya sendiri.

import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import CartDrawer from "@/components/public/CartDrawer";
import CheckoutModal from "@/components/public/CheckoutModal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Global cart UI — rendered at layout level so they overlay everything */}
      <CartDrawer />
      <CheckoutModal />
    </>
  );
}
