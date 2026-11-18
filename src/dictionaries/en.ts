// ============================================================
// PASzar — English Dictionary
// ============================================================

type TrustItem = { title: string; desc: string };
type NavLink = { label: string; href: string };
type PartnerCode = "imipas" | "lapas" | "rutan" | "koperasi";
type PartnerItem = { code: PartnerCode; name: string; role: string };

export interface GuidanceSlide {
  title: string;
  body: string;
  image: string;
}

export interface Dictionary {
  header: {
    brand: string;
    nav: {
      home: string;
      shop: string;
      artisans: string;
      about: string;
    };
    cart: string;
    search: string;
    searchBox: {
      title: string;
      placeholder: string;
      popularLabel: string;
      popularTags: readonly string[];
      recentLabel: string;
      clearRecent: string;
      submitHint: string;
      resultsLabel: string;
      noResults: string;
      viewAll: (q: string) => string;
      close: string;
    };
  };
  footer: {
    brand: string;
    subtitle: string;
    tagline: string;
    cta: string;
    sections: {
      shop: { title: string; links: readonly NavLink[] };
      company: { title: string; links: readonly NavLink[] };
      care: { title: string; links: readonly NavLink[] };
    };
    copyright: (year: number) => string;
    rights: string;
  };
  page: {
    hero: { eyebrow: string; title: string; desc: string; cta: string; story: string };
    artisans: {
      eyebrow: string;
      title: string;
      categories: readonly { image: string; title: string; desc: string }[];
    };
    featured: {
      eyebrow: string;
      title: string;
      viewAll: string;
      viewAllMobile: string;
      empty: string;
      emptyHint: string;
    };
    trust: readonly TrustItem[];
    about: {
      slides: readonly GuidanceSlide[];
    };
    partners: {
      eyebrow: string;
      title: string;
      items: readonly PartnerItem[];
      hashtag: string;
    };
  };
  katalog: {
    breadcrumb: { home: string; shop: string };
    title: string;
    filter: {
      category: string;
      all: string;
      price: string;
      priceRanges: readonly string[];
      clearAll: (n: number) => string;
      button: string;
    };
    sort: { label: string; priceAsc: string; priceDesc: string; name: string };
    count: (n: number) => string;
    showingRange: (start: number, end: number, total: number) => string;
    prevPage: string;
    nextPage: string;
    empty: string;
    clearFilters: string;
    showProducts: (n: number) => string;
  };
  product: {
    breadcrumb: { home: string; shop: string };
    qty: string;
    available: (n: number) => string;
    outOfStock: string;
    addToCart: string;
    buyNow: string;
    buyExternal: string;
    externalNotice: string;
    description: string;
    story: string;
    badges: readonly string[];
    related: { eyebrow: string; title: string; viewAll: string };
  };
}

export const en: Dictionary = {
  // ── Header ──────────────────────────────────────────────────
  header: {
    brand: "PASzar",
    nav: {
      home: "Home",
      shop: "Products",
      artisans: "Artisans",
      about: "Guidance",
    },
    cart: "Cart",
    search: "Search",
    searchBox: {
      title: "Search Catalog",
      placeholder: "What craft are you looking for? (e.g. Tenun, Crochet Bag, Tissue Box...)",
      popularLabel: "Popular Searches",
      popularTags: ["Tenun", "Tas Rajut", "Selendang", "Cake", "Bunga", "Kotak Tisu"],
      recentLabel: "Recent Searches",
      clearRecent: "Clear",
      submitHint: "Type to preview or press Enter to view all in catalog",
      resultsLabel: "Matching Products",
      noResults: "No matching products found for your keyword.",
      viewAll: (q: string) => `View all results for "${q}"`,
      close: "Close search",
    },
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    brand: "PASZAR",
    subtitle: "Crafted by Guided Artisans · Kupang, NTT",
    tagline:
      "Official showcase of handcrafted works by guided artisans at Lapas Kelas IIA & Rutan Kelas IIB Kupang. Every order through the Cooperative delivers fair appreciation and lasting independence.",
    cta: "Explore Collection",
    sections: {
      shop: {
        title: "Craft Collection",
        links: [
          { label: "All Creations", href: "/katalog" },
          { label: "Tenun & Textile Craft", href: "/katalog" },
          { label: "Woodcraft & Miniatures", href: "/katalog" },
          { label: "Lontar Weaving & Decor", href: "/katalog" },
        ],
      },
      company: {
        title: "About PASzar",
        links: [
          { label: "Guidance Programme", href: "/#about" },
          { label: "The Artisans", href: "/#artisans" },
          { label: "Institutional Synergy", href: "/#partners" },
        ],
      },
      care: {
        title: "Cooperative Desk",
        links: [
          { label: "WhatsApp Ordering Guide", href: "/katalog" },
          { label: "Authenticity Guarantee", href: "/#about" },
          { label: "Official Partners", href: "/#partners" },
        ],
      },
    },
    copyright: (year: number) =>
      `© ${year} PASzar — Koperasi Pemasyarakatan Lapas & Rutan Kupang, NTT.`,
    rights: "All Rights Reserved",
  },

  // ── Landing Page ─────────────────────────────────────────────
  page: {
    hero: {
      eyebrow: "Handcrafted Goods — By WBP, NTT",
      title: "From Guidance,\nComes Creation.",
      desc: "Through structured correctional guidance, time is transformed into craftsmanship — every piece is tangible proof of perseverance, dignity, and purpose.",
      cta: "Explore Collection",
      story: "Our Story",
    },

    artisans: {
      eyebrow: "The Makers",
      title: "Crafted By WBP",
      categories: [
        {
          image: "/images/product-tenun.jpg",
          title: "Tenun & Heritage Textiles",
          desc: "Traditional East Nusa Tenggara woven crafts and cultural motifs crafted with care inside the empowerment studio.",
        },
        {
          image: "/images/product-chair.jpg",
          title: "Woodcraft & Miniatures",
          desc: "Hand-shaped teak seating, carved picture frames, Sasando miniatures, and timber crafts built in the Kupang carpentry workshop.",
        },
        {
          image: "/images/product-rattan.jpg",
          title: "Woven Crafts & Local Culinary",
          desc: "Lontar dulang baskets, betel boxes, coconut shell keychains, and hygienic local snacks curated by the cooperative.",
        },
      ],
    },

    featured: {
      eyebrow: "Curated Selection",
      title: "Featured Creations",
      viewAll: "View All",
      viewAllMobile: "View All Products",
      empty: "No products available yet.",
      emptyHint: "Products will appear once the cooperative admin publishes them.",
    },

    trust: [
      {
        title: "Authentic Inmate Craft",
        desc: "Handcrafted inside the workshops of Lapas Kelas IIA & Rutan Kelas IIB Kupang",
      },
      {
        title: "Curated Local Works",
        desc: "From wooden Sasando, dulang & betel boxes to furniture, florals, and pakcoy crisps",
      },
      {
        title: "Supports Rehabilitation",
        desc: "Proceeds directly fund vocational skill training and artisan compensation",
      },
      {
        title: "Official Cooperative Order",
        desc: "Orders are verified directly via the correctional cooperative WhatsApp desk",
      },
    ],

    about: {
      slides: [
        {
          title: "Ethical Craftsmanship & Purpose",
          body: "Every piece is born from the dedication of inmate artisans in Kupang mastering new skills. More than functional objects, each detail carries a story of hope, dignity, and a second chance.",
          image: "/images/hero-bg-1.jpg",
        },
        {
          title: "Sustainable & Thoughtful Design",
          body: "Over 80% of our collection uses local materials—teak wood, lontar palm, and coconut shell—alongside thoughtfully upcycled materials to create functional pieces for daily life.",
          image: "/images/product-rattan.jpg",
        },
        {
          title: "Cultural Appreciation & Heritage",
          body: "We blend East Nusa Tenggara craft traditions with timeless design. From ikat weaving and woven lontar trays to miniature Sasando harps shaped entirely by hand.",
          image: "/images/product-tenun.jpg",
        },
        {
          title: "Empowering Real Independence",
          body: "We work through the cooperative to ensure fair appreciation for every artisan while building lasting vocational confidence as they return to the community.",
          image: "/images/product-chair.jpg",
        },
      ],
    },

    partners: {
      eyebrow: "Partners & Institutional Support",
      title: "Official Correctional Synergy in NTT",
      items: [
        {
          code: "imipas",
          name: "Kementerian Imigrasi & Pemasyarakatan RI",
          role: "Ditjen Pemasyarakatan — Kanwil NTT",
        },
        {
          code: "lapas",
          name: "Lapas Kelas IIA & Lapas Perempuan Kelas IIB Kupang",
          role: "Correctional Workshop & Craft Studio",
        },
        {
          code: "rutan",
          name: "Rutan Kelas IIB Kupang",
          role: "Vocational Empowerment & Upcycling",
        },
        {
          code: "koperasi",
          name: "Koperasi Pemasyarakatan",
          role: "Official Order & Artisan Welfare Desk",
        },
      ],
      hashtag: "#pemasyarakatanNTT",
    },
  },

  // ── Katalog ──────────────────────────────────────────────────
  katalog: {
    breadcrumb: { home: "Home", shop: "Products" },
    title: "All Products",
    filter: {
      category: "Category",
      all: "All",
      price: "Price",
      priceRanges: [
        "All Prices",
        "< Rp 100,000",
        "Rp 100,000 – 500,000",
        "Rp 500,000 – 2,000,000",
        "> Rp 2,000,000",
      ],
      clearAll: (n: number) => `Clear all filters (${n})`,
      button: "Filter",
    },
    sort: {
      label: "Sort by",
      priceAsc: "Price ↑",
      priceDesc: "Price ↓",
      name: "A — Z",
    },
    count: (n: number) => `${n} products`,
    showingRange: (start: number, end: number, total: number) =>
      `Showing ${start}–${end} of ${total} products`,
    prevPage: "Previous",
    nextPage: "Next",
    empty: "No products match your filters.",
    clearFilters: "Clear filters",
    showProducts: (n: number) => `Show ${n} Products`,
  },

  // ── Product Detail ────────────────────────────────────────────
  product: {
    breadcrumb: { home: "Home", shop: "Products" },
    qty: "Quantity",
    available: (n: number) => `${n} in stock`,
    outOfStock: "Out of stock",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    buyExternal: "Buy on Origin Website",
    externalNotice:
      "Purchases for this product are completed directly on the official origin product page.",
    description: "Description",
    story: "The Story",
    badges: ["Authentic Inmate Craft", "Official Cooperative Order", "Curated Quality"],
    related: {
      eyebrow: "You May Also Like",
      title: "Related Products",
      viewAll: "View All",
    },
  },
};
