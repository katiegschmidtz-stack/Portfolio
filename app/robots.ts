import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /resume is deliberately not disallowed: crawlers must be able to fetch it
// to see its noindex tag, or a linked URL could still be listed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
