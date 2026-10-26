import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Hide the floating "N" dev-tools badge (dev-only overlay; never ships
  // in production anyway).
  devIndicators: false,
  // Pin the workspace root so a stray lockfile elsewhere is ignored.
  outputFileTracingRoot: __dirname,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
