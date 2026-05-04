import type { NextConfig } from "next";
import path from "path";
import { resolveBackendOriginAtBuildTime } from "./src/lib/server-backend-origin";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  /** Proxy API NestJS (port 3001) quand le front utilise une URL relative `/api`. */
  async rewrites() {
    const origin = resolveBackendOriginAtBuildTime();
    return [
      {
        source: "/api/:path*",
        destination: `${origin}/api/:path*`,
      },
    ];
  },
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
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
