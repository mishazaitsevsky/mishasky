import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_TITLE = "0→1 Product | Misha Sky";

const SHARE_IMAGE = {
  url: "/images/Preview/NBS_home_Preview.png",
  width: 1200,
  height: 600,
  alt: "Amazon Nova Builder Studio, designed by Misha Sky",
};

export const metadata: Metadata = {
  // Lets share-image and other URL fields use site paths
  metadataBase: new URL("https://mishasky.net"),
  title: SITE_TITLE,
  description: "Misha Sky is a 0→1 product designer working in AI: agents, tools and narrow use cases. Case studies from Amazon Nova, Funko, Sony and more, plus articles on taste, AI and the future of design.",
  alternates: { canonical: "/" },
  // Link previews (LinkedIn, Slack, iMessage). Every page uses this until pages get their own.
  openGraph: {
    type: "website",
    siteName: "Misha Sky",
    title: SITE_TITLE,
    description: "Misha Sky is a 0→1 product designer working in AI: agents, tools and narrow use cases. Case studies from Amazon Nova, Funko, Sony and more, plus articles on taste, AI and the future of design.",
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: "Misha Sky is a 0→1 product designer working in AI: agents, tools and narrow use cases. Case studies from Amazon Nova, Funko, Sony and more, plus articles on taste, AI and the future of design.",
    images: [SHARE_IMAGE.url],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No maximumScale: pinch zoom stays available (accessibility).
  // Text inputs are kept at 16px+ so iPhone doesn't auto-zoom on tap.
};

// Tells search engines who the site is about, under both names.
const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Misha Sky",
  alternateName: ["Misha A. Sky", "Michael A. Sky"],
  gender: "Male",
  jobTitle: "Product Designer",
  url: "https://mishasky.net",
  sameAs: [
    "https://github.com/mishazaitsevsky",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
