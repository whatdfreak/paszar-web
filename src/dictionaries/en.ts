// ============================================================
// PASzar — English Dictionary
// ============================================================

// Helper types — define the shape structurally, not as string literals
type TrustItem = { title: string; desc: string };
type Feature = { title: string; desc: string };
type NavLink = { label: string; href: string };

export interface Dictionary {
  header: {
    brand: string;
    nav: { home: string; shop: string; artisans: string; about: string };
    cart: string;
    search: string;
  };
  footer: {
    brand: string;
    tagline: string;
    newsletter: { label: string; placeholder: string; button: string };
    sections: {
      service: { title: string; links: readonly string[] };
      company: { title: string; links: readonly NavLink[] };
      shop: { title: string; links: readonly NavLink[] };
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
      eyebrow: string;
      title: string;
      tagline: string;
      body: readonly string[];
      features: readonly Feature[];
    };
    partners: { eyebrow: string; names: readonly string[]; hashtag: string };
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
      shop: "Shop",
      artisans: "Artisans",
      about: "About",
    },
    cart: "Cart",
    search: "Search",
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    brand: "PASzar",
    tagline:
      "A platform for handcrafted goods made by inmates of Lapas Kupang. Every purchase is a real act of supporting empowerment.",
    newsletter: {
      label: "Newsletter",
      placeholder: "Your email",
      button: "Subscribe",
    },
    sections: {
      service: {
        title: "Customer Service",
        links: ["How to Order", "Shipping & Postage", "Return Policy", "Contact Us"],
      },
      company: {
        title: "About",
        links: [
          { label: "About Us", href: "/#about" },
          { label: "The Artisans", href: "/#artisans" },
          { label: "Featured Products", href: "/katalog" },
          { label: "Lapas Cooperative", href: "/#koperasi" },
        ],
      },
      shop: {
        title: "Products",
        links: [
          { label: "All Products", href: "/katalog" },
          { label: "Woven Textiles", href: "/katalog" },
          { label: "Local Culinary", href: "/katalog" },
          { label: "Crafts & Carvings", href: "/katalog" },
        ],
      },
    },
    copyright: (year: number) =>
      `© ${year} PASzar — Cooperative of Lapas Kupang, Kanwil Kemenkumham NTT.`,
    rights: "All Rights Reserved",
  },

  // ── Landing Page ─────────────────────────────────────────────
  page: {
    // Hero
    hero: {
      eyebrow: "Handcrafted Goods — By WBP, NTT",
      title: "From Guidance,\nComes Creation.",
      desc: "From the rehabilitation process, time is transformed into an opportunity to produce valuable creations — each piece a testament to purpose and perseverance.",
      cta: "Explore Collection",
      story: "Our Story",
    },

    // Artisan section
    artisans: {
      eyebrow: "The Makers",
      title: "Crafted By WBP",
      categories: [
        {
          image: "/images/product-chair.png",
          title: "Food",
          desc: "Local culinary specialties crafted with time-honoured recipes — a taste of NTT heritage in every bite.",
        },
        {
          image: "/images/product-tenun.png",
          title: "Furniture",
          desc: "Solid teak and mahogany furniture, hand-carved by skilled artisans trained within the rehabilitation programme.",
        },
        {
          image: "/images/product-rattan.png",
          title: "Vegetables",
          desc: "Fresh, organically grown produce cultivated as part of the agricultural rehabilitation initiative.",
        },
      ],
    },

    // Featured products section
    featured: {
      eyebrow: "Curated Selection",
      title: "Other Creations",
      viewAll: "View All",
      viewAllMobile: "View All Products",
      empty: "No products available yet.",
      emptyHint: "Products will appear once the admin adds them.",
    },

    // Trust bar
    trust: [
      {
        title: "Every Purchase Matters",
        desc: "Directly supporting the rehabilitation programme of WBP",
      },
      {
        title: "Built to Last",
        desc: "Handmade with premium natural materials",
      },
      {
        title: "Tenun",
        desc: "Traditional ikat weaving using natural dyes from local NTT plants",
      },
      {
        title: "Nationwide Delivery",
        desc: "Carefully packed and shipped across the archipelago",
      },
    ],

    // About / Story section
    about: {
      eyebrow: "Guidance",
      title: "Guidance Through\nCraft and Purpose",
      tagline: "Kreativitas Tanpa Batas, dari Pemasyarakatan Untuk Indonesia",
      body: [
        "PASzar is a platform dedicated to showcasing exceptional handcrafted goods produced through rehabilitation programmes at Lapas Kupang, Nusa Tenggara Timur. Every purchase directly supports the artisans in building a sustainable future.",
        "Through intensive training in woodworking, textile weaving, culinary arts, and craftsmanship, our makers develop skills that transform lives and preserve the cultural heritage of NTT.",
      ],
      features: [
        { title: "Professional Training", desc: "Certified instructors" },
        { title: "Quality Assured", desc: "Strict production standards" },
        { title: "Social Impact", desc: "Supporting rehabilitation" },
        { title: "Sustainable", desc: "Eco-friendly materials" },
      ],
    },

    // Partners
    partners: {
      eyebrow: "Partners & Support",
      names: ["Kemenkumham RI", "Pemprov NTT", "UMKM Indonesia", "Lapas Cooperative"],
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
    description: "Description",
    story: "The Story",
    badges: ["Authentic Product", "Secure Shipping", "Quality Assured"],
    related: {
      eyebrow: "You May Also Like",
      title: "Related Products",
      viewAll: "View All",
    },
  },
};
