/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'production' ? '/<GITLAB_PROJECT_NAME>' : '',
  reactStrictMode: true,
  images: {
    loader: 'akamai',
    path: '/'
  }
}

module.exports = nextConfig
