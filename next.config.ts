import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) dynamically resolves a worker file at a
  // relative path at runtime; bundling it breaks that resolution inside
  // Route Handlers. Opt it out of bundling so it runs as native Node require.
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist'],
};

export default nextConfig;
