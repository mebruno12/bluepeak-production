import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Base path for deployment at bluepeak.pt/calculadora-investimento-imobiliario
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Asset prefix for correct resource loading
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  // Trailing slash for better URL handling
  trailingSlash: true,

  // Output standalone for optimized Vercel deployment
  output: 'standalone',
};

export default nextConfig;
