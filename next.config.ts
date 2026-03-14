import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
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
    ];
  },
};

export default nextConfig;
