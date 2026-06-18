import type { NextConfig } from "next";

/**
 * Next.js configuration for EcoAgent.
 *
 * Why static export: produces plain HTML/CSS/JS files that nginx serves
 * directly without a Node.js runtime. This is critical for the multi-stage
 * Docker build to keep the production image under the 10MB limit.
 */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
