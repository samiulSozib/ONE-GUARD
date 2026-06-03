import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    domains: ['ogs.api.v1.1guardsecurity.com'],
    // If you're using Next.js 13+ you might want to use remotePatterns instead:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'ogs.api.v1.1guardsecurity.com',
    //     port: '',
    //     pathname: '/storage/uploads/**',
    //   },
    // ],
  },
};

export default nextConfig;
