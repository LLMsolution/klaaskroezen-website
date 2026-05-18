import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 days — Convex URLs don't send cache headers
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "*.convex.site",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Note: /Sales-Excellence-Training → /sales-excellence-training
      // handled via middleware (next.config redirects are case-insensitive)
      {
        source: "/boek-sales-oprecht-&-ontspannen",
        destination: "/boek",
        permanent: true,
      },
      {
        source: "/over-mij",
        destination: "/over-ons",
        permanent: true,
      },
      {
        source: "/klaas-kroezen",
        destination: "/over-ons",
        permanent: true,
      },
      // Canonical marketing URLs are /sales-excellence-training and
      // /customer-success-training. Redirect the legacy /training/[slug]/marketing
      // alias paths to the canonical URLs (preserve SEO equity).
      {
        source: "/training/set-online/marketing",
        destination: "/sales-excellence-training",
        permanent: true,
      },
      {
        source: "/training/cst-online/marketing",
        destination: "/customer-success-training",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
