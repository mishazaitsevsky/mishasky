export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
  layout?: "hero" | "editorial" | "pair-left" | "pair-right" | "grid3-start";
  radius?: number;
  stroke?: boolean;
  blend?: string;    // CSS mix-blend-mode e.g. "multiply"
  vimeoId?: string;   // if set, renders a Vimeo embed instead of an image
  vimeoStart?: number; // start time in seconds
};

export type ProjectSection = {
  label?: string;
  title?: string;
  body?: string;
  twoCol?: boolean;
  centerText?: boolean; // center-align eyebrow, title, body
  images: ProjectImage[];
  splitBottom?: boolean; // this section belongs to the bottom half-card
};

export type Project = {
  slug: string;
  client: string;
  category: string;
  title: string;
  shortDesc: string;
  role: string;
  year: string;
  thumb: string;
  thumbStandard?: string;
  thumbGameboy?: string; // override thumb for gameboy theme
  thumbBlend?: string; // CSS mix-blend-mode for standard thumb
  thumbBg: string;
  thumbContain?: boolean;
  theme: "light" | "dark";
  cardStyle?: "default" | "split-gradient"; // split-gradient = two joined half-cards
  cardBg?: string;   // top card bg (split-gradient) or single card bg override
  cardBg2?: string;  // bottom card bg (split-gradient only)
  cardBgImage?: string; // background peek image on top card
  cardTextColor?: string; // override text color on standard card
  gbStyle?: boolean; // apply gameboy inner shadow + styling
  ctaLabel?: string; // override "View" CTA text
  sections: ProjectSection[];
  images?: { src: string; alt: string; caption?: string }[];
  body?: string;
};

export const projects: Project[] = [
  {
    slug: "icon-agent",
    client: "Amazon Nova",
    category: "AMAZON NOVA",
    title: "Icon Agent / Kiro Power",
    shortDesc: "You can't train taste into a model. But after 130 bespoke icons for Amazon's Frontier AI Playground, it turned out you could teach it.",
    role: "Icon Design / AI",
    year: "2025",
    thumb: "/images/amazon/Contact.png",
    thumbBg: "#F3F3F7",
    theme: "light",
    sections: [],
    images: [],
    body: "",
  },
  {
    slug: "rpg",
    client: "Self",
    category: "FIT RPG",
    title: "Interactive Role Preference Guide (R.P.G.)",
    shortDesc: "Helping hire right. (Even if it's not me.)",
    role: "Product Design / Game Design",
    year: "2026",
    thumb: "",
    thumbBg: "#D9D4CF",
    cardBg: "#D9D4CF",
    cardTextColor: "#3A4324",
    gbStyle: true,
    theme: "light",
    sections: [],
    images: [],
    body: "",
  },
  {
    slug: "shrapnel",
    client: "Shrapnel",
    category: "GAMING",
    title: "Shrapnel Design System",
    shortDesc: "Full design system for a web3 FPS game — icons, components, inventory, and marketplace across all breakpoints.",
    role: "Design Systems / Product Design",
    year: "2024",
    thumb: "/images/shrapnel/Shrapnel_thumb.png",
    thumbStandard: "/images/shrapnel/Shrapnel_thumb.png",
    thumbBg: "#FFCE00",
    cardBg: "#FFCE00",
    cardTextColor: "#000000",
    theme: "dark",
    sections: [
      {
        body: "Shrapnel is a web3 FPS game with a full in-game economy. The work covered the entire design system: a custom icon set of 60+ icons, component library, navigation patterns, inventory management, and marketplace — all documented across desktop, tablet, and mobile breakpoints.",
        images: [],
      },
      {
        label: "Process",
        title: "Clever title for this section.",
        body: "I wanted to make our modest team of 10 feel like 100. Efficient production and scalability was a top priority when establishing the framework for the web and supporting in-game screens. The developers were supplied with component library concepts early on, so we could road-map the releases in coordination with game features. These concept sketches gave the blockchain team an early understanding of potential dependencies on data-models and the subsequent APIs required to feed the marketplace and associated web experiences.",
        twoCol: true,
        images: [],
      },
      {
        label: "Gaming",
        title: "Typography Selection",
        images: [
          { src: "/images/shrapnel/TYPEREF.png",   alt: "Typography option A", layout: "pair-left" },
          { src: "/images/shrapnel/TYPEREF-1.png",  alt: "Typography option B" },
        ],
      },
      {
        label: "Mock",
        title: "Mission Rewards",
        images: [
          { src: "/images/shrapnel/Inventory_Lockup.png", alt: "Mission rewards screens", layout: "hero" },
        ],
      },
    ],
    // legacy
    images: [],
    body: "",
  },
  {
    slug: "funko",
    client: "Funko",
    category: "POP CULTURE",
    title: "FUNKO's DTC E-Commerce Website",
    shortDesc: "E-commerce platform redesign focused on direct-to-consumer sales, unified design language, and mobile-first accessibility.",
    role: "Product Design / UX",
    year: "2023",
    thumb: "/images/funko/FunkoThumb.png",
    thumbBg: "#F3F3F7",
    thumbContain: false,
    theme: "light",
    sections: [
      {
        // intro body + hero image — no label/title (shown in card header above)
        body: "• Focus main website towards Direct to Consumer Sales\n• Redirect all marketing collateral towards currently available product\n• Create one design language — web and app\n• Set company focus to mobile, accessibility, data and automation\n• Establish a stable sprint schedule and clear process for setting and evaluating releases against business goals",
        images: [
          { src: "/images/funko/Sailor_mood_desktop_hero.png", alt: "Funko homepage hero", layout: "hero" },
        ],
      },
      {
        // 3×2 grid of blue module tiles
        images: [
          { src: "/images/funko/cms/direct_to_consumer.png",     alt: "Direct to consumer",   layout: "grid3-start", radius: 32 },
          { src: "/images/funko/cms/Home_page.png",              alt: "Home page",                                   radius: 32 },
          { src: "/images/funko/cms/search_filter_nav.png",      alt: "Search and filter",                          radius: 32, stroke: true },
          { src: "/images/funko/cms/Content_pipeline.png",       alt: "Content pipeline",                           radius: 32 },
          { src: "/images/funko/cms/Blog_media_module 1.png",    alt: "Blog and media",                             radius: 32 },
          { src: "/images/funko/cms/Design_system_module 1.png", alt: "Design system",                              radius: 32 },
        ],
      },
      {
        label: "RESPONSIVE",
        title: "Consistent feel across mobile, desktop & tablet",
        images: [
          { src: "/images/funko/cms/Consistent_feel.png", alt: "Consistent feel across devices", layout: "hero" },
        ],
      },
      {
        label: "FLOW",
        title: "ORIGINAL",
        body: "• Pages and features designed and implemented in various legacy styles\n• Most of the site is designed for desktop consumption\n• Mix of shoppable and non-shoppable product in catalog\n• PDP often diverts to third-party retailers off-site\n• Complex fan club flows and sharing features, along with marketing content geared towards hardcore fans with no product purchase endpoint\n• Search is not cross-category",
        images: [
          { src: "/images/funko/cms/Original_site_flow_hero 1.png", alt: "Original site flow", layout: "editorial", radius: 32, stroke: true },
        ],
      },
      {
        label: "FLOW",
        title: "Updated",
        body: "• One site with all product available for purchase\n• Marketing content is segmented for purchase egress only\n• Fan-club & sharing features are segmented to app\n• Search is cross-site with robust product tagging\n• Campaign content is now responsive",
        images: [
          { src: "/images/funko/cms/New_site_flow 1.png", alt: "New site flow", layout: "editorial", radius: 32, stroke: true },
        ],
      },
      {
        label: "BEST PRACTICE",
        title: "Home Page",
        body: "• One site with all product available for purchase\n• Marketing content is segmented for purchase egress only\n• Fan-club & sharing features are segmented to app\n• Search is cross-site with robust product tagging\n• Campaign content is now responsive",
        images: [
          { src: "/images/funko/cms/Home.png", alt: "Home page best practice", layout: "editorial", radius: 32 },
        ],
      },
      {
        label: "NAVIGATION",
        title: "Best practices",
        body: "• One site with all product available for purchase\n• Marketing content is segmented for purchase egress only\n• Fan-club & sharing features are segmented to app\n• Search is cross-site with robust product tagging\n• Campaign content is now responsive",
        images: [
          { src: "/images/funko/cms/BestPractices_Navigation_hero.png", alt: "Navigation best practices", layout: "hero", radius: 32 },
        ],
      },
      {
        label: "NAVIGATION",
        title: "Easily visually identify property",
        images: [
          { src: "/images/funko/cms/Mobile_mock_nav_2.png", alt: "Mobile nav view 1", layout: "pair-left", radius: 32, stroke: true },
          { src: "/images/funko/cms/Mobile_nav_mock.png",   alt: "Mobile nav view 2",                     radius: 32, stroke: true },
        ],
      },
      {
        label: "DOCUMENTATION",
        title: "CMS & Product Guidelines (sample)",
        images: [
          { src: "/images/funko/cms/CMS_product_guidelines1.png",  alt: "CMS guidelines 1", layout: "pair-left", radius: 32, stroke: true },
          { src: "/images/funko/cms/CMS_product_guidelines_1.png", alt: "CMS guidelines 2",                     radius: 32, stroke: true },
        ],
      },
    ],
    images: [],
    body: "",
  },
  {
    slug: "sony",
    client: "VMware",
    category: "IOT",
    title: "VMware Interactive Digital Wall",
    shortDesc: "Interactive digital wall installation and companion site for VMware.",
    role: "Visual Design / Front-end",
    year: "2022",
    thumb: "/images/sony/vmwarethumb1.png",
    thumbGameboy: "/images/sony/gbThumbn1.png",
    thumbStandard: "/images/sony/vmwarethumb1.png",
    thumbBlend: "multiply",
    thumbBg: "#ABCEE8",
    theme: "light",
    cardStyle: "split-gradient",
    cardBg: "#ABCEE8",
    cardBg2: "linear-gradient(180deg, #ABCEE8 29%, #6590BC 100%)",
    cardBgImage: "/images/sony/Headercrop1.png",
    sections: [
      { label: "VMWare / Sony", title: "City of the Future", body: "An IoT utopia to pitch to whales", centerText: true, images: [{ src: "/images/sony/CMS/Desktop.png", alt: "Sony desktop hero", layout: "editorial", radius: 32 }] },
      { images: [{ src: "/images/sony/CMS/AnimatedScenarios.png", alt: "Animated scenarios", layout: "grid3-start" }, { src: "/images/sony/CMS/ScalableStyle.png", alt: "Scalable style" }, { src: "/images/sony/CMS/ResponsiveDesign.png", alt: "Responsive design" }] },
      { label: "CONCEPT", title: "Simple 32° geometry", centerText: true, images: [{ src: "/images/sony/CMS/Simple_geometry.png", alt: "32 degree geometry concept", layout: "editorial", radius: 32, blend: "multiply" }] },
      { label: "APPROACH", title: "Simple Design System", body: "• Din Round + monocline 32° strokes", centerText: true, images: [{ src: "/images/sony/CMS/SimpleDesign.png", alt: "Simple design system", layout: "editorial", radius: 32, blend: "multiply" }] },
      { label: "CONSISTENCY", title: "Detail", body: "One responsive build across installation, Desktop and Mobile", centerText: true, images: [{ src: "/images/sony/CMS/Detail1.png", alt: "Detail 1", layout: "grid3-start", radius: 32 }, { src: "/images/sony/CMS/Detail2.png", alt: "Detail 2", radius: 32 }, { src: "/images/sony/CMS/Detail3.png", alt: "Detail 3", radius: 32 }] },
      { label: "FULLY RESPONSIVE", title: "Desktop", body: "One responsive build across installation, Desktop and Mobile", centerText: true, splitBottom: true, images: [{ src: "/images/sony/CMS/Desktop.png", alt: "Desktop responsive", layout: "hero" }] },
      { label: "FULLY RESPONSIVE", title: "Installations", body: "One responsive build across installation, Desktop and Mobile", centerText: true, splitBottom: true, images: [{ src: "/images/sony/CMS/thewall_execs 1.png", alt: "Wall installation", layout: "editorial", radius: 32, stroke: true }] },
      { label: "FULLY RESPONSIVE", title: "Mobile", body: "One responsive build across installation, Desktop and Mobile", centerText: true, splitBottom: true, images: [{ src: "", alt: "Sony mobile demo", layout: "editorial", vimeoId: "373539837", vimeoStart: 27, radius: 32 }] },
      { label: "END", title: "fin", centerText: true, splitBottom: true, images: [{ src: "/images/sony/CMS/Fin.png", alt: "Fin", layout: "editorial", radius: 32, stroke: true }] },
    ],
    images: [],
    body: "",
  },
  {
    slug: "amazon",
    client: "Amazon",
    category: "AI TECH",
    title: "AGI & Amazon Nova",
    shortDesc: "Product design across Amazon's frontier AI platform — model catalog, icon system, Builder Studio, Content Partners, and Nova Sonic.",
    role: "Product Design / AI Platform",
    year: "2024–2025",
    thumb: "/images/amazon/Nova_Nav.png",
    thumbStandard: "/images/amazon/Nova_Nav.png",
    thumbBg: "#B131FF",
    thumbContain: true,
    cardBg: "linear-gradient(135deg, #B131FF 0%, #FF3578 100%)",
    cardTextColor: "#ffffff",
    theme: "dark",
    sections: [
      // ── 1. Hero (image TBD) ─────────────────────────────────────────────
      // ── 2. Nova Builder Studio + CMS ────────────────────────────────────
      {
        label: "AMAZON — AGI",
        title: "Nova Builder Studio + CMS",
        body: "Showcased at re:Invent 2025. NBS provided developers with feature-sets to onboard models, test ACT Browser automation, and showcase Amazon's latest frontier models.",
        images: [
          { src: "/images/amazon/nova_hero_2.png", alt: "Nova Builder Studio", layout: "hero" },
        ],
      },
      // ── 3. NBS interface detail ──────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/NBSCMS1.png", alt: "NBS Model User Guide", layout: "editorial", radius: 32, blend: "multiply" },
        ],
      },
      // ── 4. Custom CMS: from Quip to web ─────────────────────────────────
      {
        label: "NOVA BUILDER STUDIO",
        title: "Custom CMS: from Quip to web",
        body: "Developers want things fast and easy. Internal teams at Amazon want to share knowledge, and external customers want to quickly consume AWS & Bedrock's vast documentation. I designed a ground-up CMS that converted Quip docs into Nova Design Library tokens.",
        images: [],
      },
      // ── 5. CMS pair ──────────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/CustomCMS2.png", alt: "Custom CMS interface A", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/CustomCMS3.png", alt: "Custom CMS interface B", radius: 32 },
        ],
      },
      // ── 6. MODULAR FLEXIBILITY — vertical stack ──────────────────────────
      {
        label: "NOVA BUILDER STUDIO",
        title: "Modular Flexibility",
        body: "How do you strike a balance between the variety creators need, consistency of design, and ease of publishing? By creating a modular system that has just the right amount of choice, while making the vast majority of content sing.",
        images: [
          { src: "/images/amazon/nova_content_b.png", alt: "Modular content B", layout: "editorial", radius: 32 },
          { src: "/images/amazon/nova_content_a.png", alt: "Modular content A", layout: "editorial", radius: 32 },
        ],
      },
      // ── 7. NOVA DESIGN SYSTEM — Icon Library ────────────────────────────
      {
        label: "NOVA DESIGN SYSTEM",
        title: "Shipped 130+ Icon Library",
        body: "Before I created RUNE — a lightweight custom icon generator — I hand-drew hundreds of icons for Nova Playground in Figma. Every icon follows strict geometric constraints consistent with the Nova design language.",
        images: [
          { src: "/images/amazon/Type=Print, Size=Large.svg", alt: "Print icon", layout: "grid2-start", blend: "multiply" },
          { src: "/images/amazon/Type=Thumbs Up, Size=Large.svg", alt: "Thumbs Up icon", blend: "multiply" },
          { src: "/images/amazon/Type=Nova Cards Agent, Size=Large.svg", alt: "Nova Cards Agent icon", layout: "grid4-start", blend: "multiply" },
          { src: "/images/amazon/Type=Folder, Size=Large.svg", alt: "Folder icon", blend: "multiply" },
          { src: "/images/amazon/Type=Connect, Size=Large.svg", alt: "Connect icon", blend: "multiply" },
          { src: "/images/amazon/Type=Attach, Size=Large.svg", alt: "Attach icon", blend: "multiply" },
        ],
      },
      // ── 8. Design system specs — light + dark pair ───────────────────────
      {
        images: [
          { src: "/images/amazon/Screenshot 2026-10-12 at 4.45.23 PM.png", alt: "Nova Design System component spec light", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/Screenshot 2026-10-12 at 4.51.45 PM.png", alt: "Nova Design System component spec dark", radius: 32 },
        ],
      },
      // ── 9. POST ICON BURNOUT — KIRO POWER ───────────────────────────────
      {
        label: "KIRO POWER",
        title: "Post Icon Burnout...",
        body: "Can you encode the taste of one designer into a lightweight steering file for any LLM to use? Turns out you can. RUNE is a 64kb steering-based agent that makes icons exactly as I would.",
        images: [
          { src: "/images/amazon/PostIconBurnout1.png", alt: "Kiro Power icon agent", layout: "hero" },
        ],
      },
      // ── 10. PROMPT: "Create 20 Icons" ───────────────────────────────────
      {
        label: "PROMPT:",
        title: '"Create 20 Icons"',
        body: "RUNE utilizes several steering text files, meticulously describing my exact idea of a great icon. Although this example focuses on NDS (Nova Design System) style, RUNE can be easily modified for any style of iconography.",
        images: [
          { src: "/images/amazon/Prompt Inspiration Cards.png", alt: "Prompt inspiration cards carousel", layout: "editorial", radius: 32 },
        ],
      },
      // ── 11. RUNE output editorial ────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/nova_rune.png", alt: "Rune icon output", layout: "editorial", radius: 32 },
        ],
      },
      // ── 12. MOTION — SPECIFICATIONS & EXAMPLES ──────────────────────────
      {
        label: "MOTION",
        title: "Specifications & Examples",
        body: "These specs for standardizing Nova's motion patterns are built to last. From curve (timing) to duration, these rules and examples make it easy to make the right call for 'delight', every time.",
        images: [
          { src: "/images/amazon/nova_hero_4.png", alt: "Motion specifications", layout: "hero" },
        ],
      },
      // ── 13. Motion spec editorial ────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/SpecificationsEx2.png", alt: "Motion spec detail", layout: "editorial", radius: 32 },
        ],
      },
      // ── 14. NEW FEATURE DISCOVERY ────────────────────────────────────────
      {
        label: "MOTION",
        title: "New Feature Discovery",
        body: "New technology requires context. When a new feature like Agent Deep Research comes along, customers need a little visual nudge to make announcements sticky.",
        images: [
          { src: "/images/amazon/nova_nfd.png", alt: "New feature discovery", layout: "editorial", radius: 32 },
        ],
      },
      // ── 15. Feature pair ─────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/nova_feat_a.png", alt: "Feature detail A", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/nova_feat_b.png", alt: "Feature detail B", radius: 32 },
        ],
      },
    ],
    images: [],
    body: "",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

