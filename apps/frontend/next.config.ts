import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: [
    "@rainbow-me/rainbowkit",
    "@vanilla-extract/sprinkles",
  ],
};

export default nextConfig;