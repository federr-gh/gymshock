/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['ejerciciosdb.com', 'rapidapi.com', 'i.ytimg.com', 'i9.ytimg.com', 'gymvisual.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v2.exercisedb.io',
      },
    ],
  },
  // Opcional: Añadir configuración para el API si es necesario
  async rewrites() {
    return [
      {
        source: '/api/exercises/:path*',
        destination: 'https://exercisedb.p.rapidapi.com/:path*',
      },
    ];
  },
}

module.exports = nextConfig