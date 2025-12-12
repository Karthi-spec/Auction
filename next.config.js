/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for frontend-only deployment
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  images: {
    unoptimized: true
  },
  
  // Optimize for production
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig