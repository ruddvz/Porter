/** @type {import('next').NextConfig} */
const basePath = process.env.BASE_PATH ?? "";
const assetPrefix =
  process.env.ASSET_PREFIX !== undefined
    ? process.env.ASSET_PREFIX
    : basePath || undefined;

const nextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: assetPrefix || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
