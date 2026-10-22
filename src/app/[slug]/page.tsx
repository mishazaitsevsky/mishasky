import type { Metadata } from "next";
import { getProject, publishedProjects, DRAFT } from "@/lib/projects";
import SiteShell from "@/components/SiteShell";

// Any slug not returned below (unknown or unpublished) returns a 404.
export const dynamicParams = false;

// Pre-open the project overlay when navigating directly to /slug
export async function generateStaticParams() {
  // Unpublished projects (see lib/projects.ts) aren't built, so their URLs 404
  return publishedProjects.map(p => ({ slug: p.slug }));
}

// Per-project tab title, search snippet and link preview
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  const title = p.seoTitle ?? `${p.client} — ${p.title} | Misha Sky`;
  const description = p.seoDescription ?? p.shortDesc;
  const image = p.shareImage ?? p.thumb;
  return {
    title,
    description,
    alternates: { canonical: `/${p.slug}` },
    // Drafts can be reviewed by URL but stay out of search until their card goes live
    ...(DRAFT.has(p.slug) ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "article",
      siteName: "Misha Sky",
      url: `/${p.slug}`,
      title,
      description,
      ...(image ? { images: [{ url: image, alt: `${p.client} — ${p.title}` }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SiteShell initialSlug={slug} />;
}
