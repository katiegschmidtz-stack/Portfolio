import type { NextConfig } from "next";

// Search visibility: the home page can be indexed; the chat API, the web
// resume, and any resume download files are kept out of search results.
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/api/:path*", headers: noindex },
      { source: "/resume", headers: noindex },
      { source: "/:file*.pdf", headers: noindex },
      { source: "/:file*.docx", headers: noindex },
    ];
  },
};

export default nextConfig;
