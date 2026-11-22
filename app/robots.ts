import type { MetadataRoute } from "next";

// /resume is deliberately not disallowed: crawlers must be able to fetch it
// to see its noindex tag, or a linked URL could still be listed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
  };
}
