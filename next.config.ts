import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the Docker build wants the standalone bundle. Leaving it on by
  // default breaks `next start`, which warns and is not the supported way to
  // run a standalone build.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
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
