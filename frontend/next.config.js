/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/final-project' : '',
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '/'
  }
}

module.exports = nextConfig
