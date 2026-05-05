import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /** Prisma 7 : une URL non vide doit être présente au build (Mongo réel ou placeholder). */
  env: {
    DATABASE_URL:
      (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) ||
      "mongodb://127.0.0.1:27017/bmp_build_placeholder",
  },
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      // Démo / seed
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      // Fichiers servis par le backend Nest en local (uploads)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3002",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
