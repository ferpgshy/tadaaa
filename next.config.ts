import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O endereço antigo (Partiko) manda todo mundo para o novo, mantendo o caminho.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "partiko-games.vercel.app" }],
        destination: "https://playtadaaa.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
