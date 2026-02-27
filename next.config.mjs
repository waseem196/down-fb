/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker multi-stage build (copies only what's needed to run)
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.facebook.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
