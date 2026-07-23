import type { NextConfig } from "next";

const isCloudflareBuild = process.env.CF_BUILD === "1";

const nextConfig: NextConfig = {
  ...(isCloudflareBuild
    ? { output: "export" as const, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;

