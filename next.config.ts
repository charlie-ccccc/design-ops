import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
};

export default nextConfig;
