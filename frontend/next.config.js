/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/final-project/frontend/' : '',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '/'
  }
}

module.exports = nextConfig
