// ============================================================
// PASzar — Kamus Bahasa Indonesia
// ============================================================

import type { Dictionary } from "./en";

export const id: Dictionary = {
  // ── Header ──────────────────────────────────────────────────
  header: {
    brand: "PASzar",
    nav: {
      home: "Beranda",
      shop: "Produk",
      artisans: "Pengrajin",
      about: "Tentang",
    },
    cart: "Keranjang",
    search: "Cari",
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    brand: "PASzar",
    tagline:
      "Platform kerajinan tangan warga binaan Lapas Kupang. Setiap pembelian adalah aksi nyata mendukung pemberdayaan.",
    newsletter: {
      label: "Newsletter",
      placeholder: "Email Anda",
      button: "Daftar",
    },
    sections: {
      service: {
        title: "Layanan Pelanggan",
        links: ["Cara Pemesanan", "Pengiriman & Ongkir", "Kebijakan Pengembalian", "Hubungi Kami"],
      },
      company: {
        title: "Tentang",
        links: [
          { label: "Tentang Kami", href: "/#about" },
          { label: "Para Pengrajin", href: "/#artisans" },
          { label: "Produk Unggulan", href: "/katalog" },
          { label: "Koperasi Lapas", href: "/#koperasi" },
        ],
      },
      shop: {
        title: "Produk",
        links: [
          { label: "Semua Produk", href: "/katalog" },
          { label: "Kerajinan Tenun", href: "/katalog" },
          { label: "Kuliner Khas", href: "/katalog" },
          { label: "Anyaman & Ukir", href: "/katalog" },
        ],
      },
    },
    copyright: (year: number) =>
      `© ${year} PASzar — Koperasi Lapas Kupang, Kanwil Kemenkumham NTT.`,
    rights: "Hak Cipta Dilindungi",
  },

  // ── Landing Page ─────────────────────────────────────────────
  page: {
    // Hero
    hero: {
      eyebrow: "Kerajinan Tangan — Oleh WBP, NTT",
      title: "Dari Proses Pembinaan,\nLahir Karya Bernilai",
      desc: "Dari proses pembinaan, waktu diubah menjadi kesempatan untuk menghasilkan karya yang bernilai — setiap produk adalah bukti nyata tekad dan tujuan.",
      cta: "Jelajahi Koleksi",
      story: "Kisah Kami",
    },

    // Artisan section
    artisans: {
      eyebrow: "Para Pengrajin",
      title: "Dibuat Oleh WBP",
      categories: [
        {
          image: "/images/product-chair.png",
          title: "Makanan",
          desc: "Kuliner khas lokal yang dibuat dengan resep turun-temurun — cita rasa warisan NTT dalam setiap sajian.",
        },
        {
          image: "/images/product-tenun.png",
          title: "Furnitur",
          desc: "Furnitur jati dan mahoni solid, diukir tangan oleh pengrajin terampil yang dilatih dalam program rehabilitasi.",
        },
        {
          image: "/images/product-rattan.png",
          title: "Sayuran",
          desc: "Hasil panen segar yang ditanam secara organik sebagai bagian dari inisiatif rehabilitasi pertanian.",
        },
      ],
    },

    // Featured products section
    featured: {
      eyebrow: "Pilihan Terkurasi",
      title: "Kreasi Lainnya",
      viewAll: "Lihat Semua",
      viewAllMobile: "Lihat Semua Produk",
      empty: "Belum ada produk tersedia.",
      emptyHint: "Produk akan ditampilkan setelah admin menambahkannya.",
    },

    // Trust bar
    trust: [
      {
        title: "Setiap Pembelian Berarti",
        desc: "Mendukung langsung program rehabilitasi warga binaan",
      },
      {
        title: "Dibuat untuk Bertahan",
        desc: "Handmade dengan bahan-bahan alami premium pilihan",
      },
      {
        title: "Tenun",
        desc: "Tenun ikat tradisional menggunakan pewarna alami dari tanaman lokal NTT",
      },
      {
        title: "Pengiriman ke Seluruh Indonesia",
        desc: "Dikemas dengan hati-hati, dikirim ke seluruh pelosok nusantara",
      },
    ],

    // About / Story section
    about: {
      eyebrow: "Pembinaan",
      title: "Pembinaan Melalui\nKarya dan Tujuan",
      tagline: "Kreativitas Tanpa Batas, dari Pemasyarakatan Untuk Indonesia",
      body: [
        "PASzar adalah platform yang didedikasikan untuk memamerkan barang kerajinan tangan luar biasa yang diproduksi melalui program rehabilitasi di Lapas Kupang, Nusa Tenggara Timur. Setiap pembelian langsung mendukung para pengrajin dalam membangun masa depan yang berkelanjutan.",
        "Melalui pelatihan intensif dalam pertukangan kayu, tenun tekstil, seni kuliner, dan kerajinan tangan, para pembuat karya kami mengembangkan keterampilan yang mengubah kehidupan dan melestarikan warisan budaya NTT.",
      ],
      features: [
        { title: "Pelatihan Profesional", desc: "Instruktur bersertifikat" },
        { title: "Kualitas Terjamin", desc: "Standar produksi ketat" },
        { title: "Dampak Sosial", desc: "Mendukung rehabilitasi" },
        { title: "Berkelanjutan", desc: "Material ramah lingkungan" },
      ],
    },

    // Partners
    partners: {
      eyebrow: "Mitra & Dukungan",
      names: ["Kemenkumham RI", "Pemprov NTT", "UMKM Indonesia", "Koperasi Lapas"],
      hashtag: "#pemasyarakatanNTT",
    },
  },

  // ── Katalog ──────────────────────────────────────────────────
  katalog: {
    breadcrumb: { home: "Beranda", shop: "Produk" },
    title: "Semua Produk",
    filter: {
      category: "Kategori",
      all: "Semua",
      price: "Harga",
      priceRanges: [
        "Semua Harga",
        "< Rp 100.000",
        "Rp 100.000 – 500.000",
        "Rp 500.000 – 2.000.000",
        "> Rp 2.000.000",
      ],
      clearAll: (n: number) => `Hapus semua filter (${n})`,
      button: "Filter",
    },
    sort: {
      label: "Urutkan",
      priceAsc: "Harga ↑",
      priceDesc: "Harga ↓",
      name: "A — Z",
    },
    count: (n: number) => `${n} produk`,
    empty: "Tidak ada produk yang sesuai filter.",
    clearFilters: "Hapus filter",
    showProducts: (n: number) => `Tampilkan ${n} Produk`,
  },

  // ── Product Detail ────────────────────────────────────────────
  product: {
    breadcrumb: { home: "Beranda", shop: "Produk" },
    qty: "Jumlah",
    available: (n: number) => `${n} tersedia`,
    outOfStock: "Stok habis",
    addToCart: "Tambah ke Keranjang",
    buyNow: "Beli Sekarang",
    description: "Deskripsi",
    story: "Kisah Produk",
    badges: ["Produk Autentik", "Pengiriman Aman", "Kualitas Terjamin"],
    related: {
      eyebrow: "Mungkin Anda Suka",
      title: "Produk Terkait",
      viewAll: "Lihat Semua",
    },
  },
};
