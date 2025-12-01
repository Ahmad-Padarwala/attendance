/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force localhost for development
  devIndicators: {
    buildActivity: true,
  },
}

module.exports = nextConfig

