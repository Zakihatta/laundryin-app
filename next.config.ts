import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Naikkan limit dari 1mb ke 5mb
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Izinkan gambar dari Supabase
      },
    ],
  },
};

export default nextConfig;