import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclure du bundling serveur les modules Node.js natifs/workers
  serverExternalPackages: ['tesseract.js', 'pdfreader'],
};

export default nextConfig;
