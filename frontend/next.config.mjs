/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'tukweb-production.up.railway.app',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Cache the large static JSON files in the browser for 1 hour
        source: '/data/:file*.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Determine the backend URL. Fallback to production Railway app.
    const backendUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://tukweb-production.up.railway.app';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
