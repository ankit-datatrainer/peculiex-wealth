/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ]
  },
  // Allow large image uploads (base64 in JSON) to pass through API routes
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb"
    }
  },
  async redirects() {
    return [
      // The products overview page was retired: products are reached only
      // through the nav dropdown. 308 so search engines move the URL's
      // equity to the home page instead of indexing a dead end.
      { source: "/products", destination: "/", permanent: true }
    ];
  },
  async rewrites() {
    const target = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:4000";
    return [
      { source: "/api/:path*", destination: `${target}/api/:path*` }
    ];
  }
};

export default nextConfig;
