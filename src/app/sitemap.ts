import type { MetadataRoute } from "next";
import { publishedProjects, DRAFT } from "@/lib/projects";

const SITE = "https://mishasky.net";

// Home + live project pages. Drafts and unpublished projects are left out.
// Add the /blog pages here once the articles get their own URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "monthly", priority: 1 },
    ...publishedProjects
      .filter(p => !DRAFT.has(p.slug))
      .map(p => ({ url: `${SITE}/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.8 })),
  ];
}
