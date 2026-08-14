import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Le PDF de l'ebook vit hors de /public pour ne pas être téléchargeable sans
  // paiement : il faut donc l'inclure explicitement dans le déploiement de la
  // route qui le sert.
  outputFileTracingIncludes: {
    "/api/ebook/download": ["./private/**"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
