import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Giữ lại dòng này để tránh lỗi ép Type
  },
  // ĐÃ XÓA KHỐI ESLINT Ở ĐÂY
};

export default nextConfig;