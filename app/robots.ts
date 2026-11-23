import type { MetadataRoute } from "next";

// The site is hidden from search with noindex (see next.config.ts and
// layout metadata). Pages are deliberately not disallowed here: crawlers
// must be able to fetch them to see the noindex, and link-preview bots
// (LinkedIn, Slack, email) need them to build previews.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
  };
}
