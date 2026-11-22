import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the home page is listed; /resume is intentionally noindex.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "monthly", priority: 1 }];
}
