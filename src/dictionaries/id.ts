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
      about: "Tentang Kami",
    },
    cart: "Keranjang",
    search: "Cari",
    searchBox: {
      title: "Pencarian Katalog",
      placeholder: "Apa yang ingin Anda cari? (mis. Tenun, Tas Rajut, Selendang, Kotak Tisu...)",
      popularLabel: "Pencarian Populer",
      popularTags: ["Tenun", "Tas Rajut", "Selendang", "Cake", "Bunga", "Kotak Tisu"],
      recentLabel: "Pencarian Terakhir",
      clearRecent: "Hapus",
      submitHint: "Ketik untuk pratinjau cepat atau tekan Enter untuk melihat semua di katalog",
      resultsLabel: "Produk Ditemukan",
      noResults: "Tidak ditemukan produk yang cocok dengan kata kunci tersebut.",
      viewAll: (q: string) => `Lihat semua hasil untuk "${q}"`,
      close: "Tutup pencarian",
    },
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    brand: "PASZAR",
    subtitle: "Karya Warga Binaan · Kupang, NTT",
    tagline:
      "Etalase resmi kerajinan tangan warga binaan Lapas Kelas IIA & Rutan Kelas IIB Kupang. Setiap pemesanan melalui Koperasi memberikan apresiasi nyata dan bekal kemandirian bagi para perajin.",
    cta: "Jelajahi Koleksi",
    sections: {
      shop: {
        title: "Koleksi Karya",
        links: [
          { label: "Semua Karya", href: "/katalog" },
          { label: "Tenun & Kriya Tekstil", href: "/katalog" },
          { label: "Kriya Kayu & Miniatur", href: "/katalog" },
          { label: "Anyaman Lontar & Dekorasi", href: "/katalog" },
        ],
      },
      company: {
        title: "Tentang PASzar",
        links: [
          { label: "Program Pembinaan", href: "/#about" },
          { label: "Para Perajin", href: "/#artisans" },
          { label: "Sinergi Kelembagaan", href: "/#partners" },
        ],
      },
      care: {
        title: "Layanan Koperasi",
        links: [
          { label: "Cara Pemesanan WhatsApp", href: "/katalog" },
          { label: "Jaminan Karya Autentik", href: "/#about" },
          { label: "Mitra & Dukungan Resmi", href: "/#partners" },
        ],
      },
    },
    copyright: (year: number) =>
      `© ${year} PASzar — Koperasi Pemasyarakatan Lapas & Rutan Kupang, NTT.`,
    rights: "Hak Cipta Dilindungi",
  },

  // ── Landing Page ─────────────────────────────────────────────
  page: {
    hero: {
      eyebrow: "Kerajinan Tangan — Oleh WBP, NTT",
      title: "Dari Proses Pembinaan,\nLahir Karya Bernilai",
      desc: "Dari proses pembinaan kemandirian, waktu diubah menjadi keahlian nyata — setiap produk adalah bukti tekad, keterampilan, dan harapan baru.",
      cta: "Jelajahi Koleksi",
      story: "Kisah Kami",
    },

    artisans: {
      eyebrow: "Para Pengrajin",
      title: "Dibuat Oleh WBP",
      categories: [
        {
          image: "/images/product-tenun.jpg",
          title: "Tenun & Tekstil Tradisional",
          desc: "Kain tenun dan kerajinan bercorak warisan Nusa Tenggara Timur yang dikerjakan tekun di ruang pembinaan.",
        },
        {
          image: "/images/product-chair.jpg",
          title: "Kriya Kayu & Miniatur",
          desc: "Kursi kayu, pigura ukir, miniatur Sasando, hingga miniatur motor kayu karya bengkel kerja Kupang.",
        },
        {
          image: "/images/product-rattan.jpg",
          title: "Anyaman & Kuliner Khas",
          desc: "Dulang, kotak sirih, kotak tisu, gantungan tempurung kelapa, hingga keripik pakcoy higienis olahan WBP.",
        },
      ],
    },

    featured: {
      eyebrow: "Pilihan Terkurasi",
      title: "Karya Unggulan",
      viewAll: "Lihat Semua",
      viewAllMobile: "Lihat Semua Produk",
      empty: "Belum ada produk tersedia.",
      emptyHint: "Produk akan ditampilkan setelah admin koperasi menerbitkannya.",
    },

    trust: [
      {
        title: "Karya Asli Warga Binaan",
        desc: "Diproduksi langsung di bengkel kerja Lapas Kelas IIA & Rutan Kelas IIB Kupang",
      },
      {
        title: "Kriya, Miniatur & Kuliner",
        desc: "Mencakup dulang, kotak sirih, sasando, pigura, bunga hias, kursi, hingga keripik pakcoy",
      },
      {
        title: "100% Mendukung Pembinaan",
        desc: "Setiap pembelian mendukung pelatihan kemandirian dan premi karya warga binaan",
      },
      {
        title: "Transaksi Resmi Koperasi",
        desc: "Pemesanan diverifikasi langsung melalui layanan WhatsApp Koperasi Pemasyarakatan",
      },
    ],

    about: {
      slides: [
        {
          title: "Karya Tangan Penuh Makna",
          body: "Setiap karya lahir dari ketekunan para perajin warga binaan di Kupang yang mengasah keahlian baru. Lebih dari sekadar benda pakai, setiap detail membawa cerita tentang harapan, martabat, dan kesempatan kedua.",
          image: "/images/hero-bg-1.jpg",
        },
        {
          title: "Material Alami & Daur Ulang",
          body: "Lebih dari 80% koleksi kami mengolah bahan lokal seperti kayu jati, daun lontar, dan tempurung kelapa, serta mendaur ulang material pilihan secara bertanggung jawab untuk menghadirkan karya fungsional dalam keseharian Anda.",
          image: "/images/product-rattan.jpg",
        },
        {
          title: "Merawat Warisan Budaya NTT",
          body: "Kami memadukan kearifan kriya tradisional Nusa Tenggara Timur dengan desain yang relevan masa kini. Dari tenun ikat, anyaman dulang, hingga miniatur Sasando yang dikerjakan dengan ketelitian tangan.",
          image: "/images/product-tenun.jpg",
        },
        {
          title: "Mendukung Kemandirian Nyata",
          body: "Kami berkolaborasi bersama Koperasi Pemasyarakatan untuk memastikan apresiasi yang adil bagi setiap perajin, sekaligus menjadi bekal keahlian mandiri saat mereka kembali ke masyarakat.",
          image: "/images/product-chair.jpg",
        },
      ],
    },

    partners: {
      eyebrow: "Mitra & Dukungan Resmi",
      title: "Sinergi Kelembagaan Pemasyarakatan NTT",
      items: [
        {
          code: "imipas",
          name: "Kementerian Imigrasi & Pemasyarakatan RI",
          role: "Direktorat Jenderal Pemasyarakatan — Kanwil NTT",
        },
        {
          code: "lapas",
          name: "Lapas Kelas IIA & Lapas Perempuan Kelas IIB Kupang",
          role: "Bengkel Kerja & Pembinaan Kemandirian",
        },
        {
          code: "rutan",
          name: "Rutan Kelas IIB Kupang",
          role: "Unit Kemandirian & Karya Daur Ulang",
        },
        {
          code: "koperasi",
          name: "Koperasi Pemasyarakatan",
          role: "Pengelola Resmi Pemasaran & Pesanan WBP",
        },
      ],
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
    showingRange: (start: number, end: number, total: number) =>
      `Menampilkan ${start}–${end} dari ${total} produk`,
    prevPage: "Sebelumnya",
    nextPage: "Berikutnya",
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
    buyExternal: "Beli di Website Asal",
    externalNotice:
      "Pembelian produk ini dilayani langsung melalui halaman produk resmi di website asal.",
    description: "Deskripsi",
    story: "Kisah Produk",
    badges: ["Karya Autentik WBP", "Pesanan Resmi Koperasi", "Kualitas Terkurasi"],
    related: {
      eyebrow: "Mungkin Anda Suka",
      title: "Produk Terkait",
      viewAll: "Lihat Semua",
    },
  },
};
