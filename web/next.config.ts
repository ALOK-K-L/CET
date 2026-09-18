import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['carriable-superseriously-jovanni.ngrok-free.dev'],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
