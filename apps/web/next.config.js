/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/database", "@repo/trpc", "@repo/services", "@repo/logger"],
};

export default nextConfig;
