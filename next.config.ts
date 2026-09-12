import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [{
      source: "/:path*",
      has: [{ type: "host", value: "profile\\.schlossers\\.at" }],
      destination: "https://hackathon.schlossers.at/2026/music-ai/profile",
      permanent: true,
    }, {
      source: "/music-ai-2026/:path*",
      destination: "/2026/music-ai/:path*",
      permanent: true,
    }];
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ] }];
  },
};

export default nextConfig;
