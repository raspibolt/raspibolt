import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Both current deployments serve from their domain root. Keep this optional
// base path for alternate previews served below a path prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
