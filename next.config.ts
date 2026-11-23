import type { NextConfig } from "next";

// Search visibility: the whole site is kept out of search results. Every
// response carries a noindex header; robots.txt still lets crawlers fetch
// pages so they can see it (a blocked URL can still be listed from links).
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: noindex }];
  },
};

export default nextConfig;
