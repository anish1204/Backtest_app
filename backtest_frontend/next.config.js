/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",           // anything under /api/
        destination: "https://trademo.onrender.com", // your backend
      },
    ];
  },
};

module.exports = nextConfig;
