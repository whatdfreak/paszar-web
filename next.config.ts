import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      // Placeholder images — used by seeded test data
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage — production image host
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      // Cloudinary — optional CDN fallback
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;

