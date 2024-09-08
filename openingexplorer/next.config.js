/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: 'standalone',

  // Setting the base path to the full path after the hostname and domain
  basePath: '/OpeningExplorer/openingexplorer/out',
  assetPrefix: '/OpeningExplorer/openingexplorer/out/',

  // Optional settings (uncomment if needed)
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  // distDir: 'dist',
};

module.exports = nextConfig;
