import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@rainbow-me/rainbowkit", "@vanilla-extract/sprinkles"],
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};
    config.resolve.alias["@react-native-async-storage/async-storage"] =
      config.resolve.alias["@react-native-async-storage/async-storage"] ??
      path.resolve(__dirname, "src/lib/asyncStorageShim.ts");
    return config;
  },
};

export default nextConfig;
