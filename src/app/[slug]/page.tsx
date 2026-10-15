import { projects } from "@/lib/projects";
import SiteShell from "@/components/SiteShell";

// Pre-open the project overlay when navigating directly to /slug
export async function generateStaticParams() {
  return projects.map(p => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SiteShell initialSlug={slug} />;
}
