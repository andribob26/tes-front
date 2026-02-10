import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        port: "", // kosongkan kalau tidak pakai port khusus
        pathname: "/coins/images/**", // lebih aman, batasi hanya path gambar coin
      },
      // kalau ada domain lain (misal avatar atau icon lain), tambah di sini
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   pathname: '/images/**',
      // },
    ],
  },
  // config lain kalau ada (eslint, etc.)
};

export default nextConfig;
