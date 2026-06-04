/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ]
  },
  async rewrites() {
    const target = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:4000";
    return [
      { source: "/api/:path*", destination: `${target}/api/:path*` }
    ];
  }
};

export default nextConfig;
