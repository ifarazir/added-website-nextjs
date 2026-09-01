import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone, which is what the Dockerfile ships.
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Enable when the S3/R2 storage driver is switched on.
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
  experimental: {
    // Uploaded files are streamed through server actions.
    serverActions: { bodySizeLimit: "12mb" },
  },
};

export default nextConfig;
