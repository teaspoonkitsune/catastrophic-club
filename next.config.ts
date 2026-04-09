import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // We use localhost:3000 as the canonical local app origin for Keycloak auth.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cataas.com',
        port: '',
        pathname: '/cat/**',
      },
      {
        protocol: 'https',
        hostname: 'http.cat',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
