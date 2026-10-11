/** @type {import('next').NextConfig} */
const nextConfig = {
  // Produces .next/standalone (a minimal server.js) used by ops-agent/Dockerfile
  output: "standalone",
  // Lint is not part of the Docker build (eslint is not a project dependency)
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
