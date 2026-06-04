import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";
const repository = "validation-sample";

const nextConfig: NextConfig = {
  output: "export",
  basePath: production ? `/${repository}` : "",
  assetPrefix: production ? `/${repository}/` : "",
};

export default nextConfig;
