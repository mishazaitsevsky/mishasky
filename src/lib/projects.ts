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
      // ── 1. Intro ──────────────────────────────────────────────────────────
      {
        body: "Product design for Amazon Nova — Amazon's frontier AI platform.\n\nWork spans the Nova model catalog page (shipped to mainline), a 130+ icon library, Nova Builder Studio (CMS showcased at re:Invent), Content Partners platform, and Nova Sonic audio chat — each shipped through standard code review on a 70-developer codebase.",
        images: [
          { src: "/images/amazon/Nova_Nav.png", alt: "Nova model catalog", layout: "hero" },
        ],
      },
      // ── 2. Model Catalog ─────────────────────────────────────────────────
      {
        label: "MODEL CATALOG",
        title: "Nova Model Catalog",
        body: "Designed and built with Kiro, then merged through standard code review. The catalog surfaces Nova's frontier AI models with filtering, hierarchy, and navigation — a production page on a 70-developer codebase.",
        images: [
          { src: "/images/amazon/nbs1.png", alt: "Nova catalog interface", layout: "editorial", radius: 32 },
        ],
      },
      // ── 3. Catalog pair ───────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/NBS_home.png", alt: "Nova Builder Studio home", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/NBS_search1.png", alt: "Nova catalog search", radius: 32 },
        ],
      },
      // ── 4. Retina hero ────────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/NBS_retina1.png", alt: "Nova catalog retina view", layout: "hero" },
        ],
      },
      // ── 5. Navigation iterations ──────────────────────────────────────────
      {
        label: "NAVIGATION",
        title: "Multiple Nav Iterations",
        body: "Designed multiple navigation iterations balancing model discovery, filtering, and Nova Design System hierarchy. Each pass tested against real usage patterns inside the platform.",
        images: [
          { src: "/images/amazon/Screenshot 2026-10-12 at 4.45.23 PM.png", alt: "Navigation iteration A", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/Screenshot 2026-10-12 at 4.51.45 PM.png", alt: "Navigation iteration B", radius: 32 },
        ],
      },
      // ── 6. Icon library intro + first grid ───────────────────────────────
      {
        label: "ICON LIBRARY",
        title: "Nova Icon Library",
        body: "Created the Nova icon library — 130+ bespoke icons encoding design taste as model instructions (Kiro Power, patent pending). Each icon follows strict geometric constraints consistent with the Nova design language.",
        images: [
          { src: "/images/amazon/Type=Agent, Size=Large.svg", alt: "Agent icon", layout: "grid3-start" },
          { src: "/images/amazon/Type=Attach, Size=Large.svg", alt: "Attach icon" },
          { src: "/images/amazon/Type=Connect, Size=Large.svg", alt: "Connect icon" },
          { src: "/images/amazon/Type=Deep Research, Size=Large.svg", alt: "Deep Research icon" },
          { src: "/images/amazon/Type=Folder, Size=Large.svg", alt: "Folder icon" },
          { src: "/images/amazon/Type=Nova Cards Agent, Size=Large.svg", alt: "Nova Cards Agent icon" },
        ],
      },
      // ── 7. Second icon grid ───────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/Type=Print, Size=Large.svg", alt: "Print icon", layout: "grid3-start" },
          { src: "/images/amazon/Type=Settings, Size=Large.svg", alt: "Settings icon" },
          { src: "/images/amazon/Type=Thumbs Up, Size=Large.svg", alt: "Thumbs Up icon" },
          { src: "/images/amazon/Type=Incognito Active, Size=Large-1.svg", alt: "Incognito icon" },
          { src: "/images/amazon/Contact.png", alt: "Contact icon" },
          { src: "/images/amazon/Contact_negative.png", alt: "Contact negative icon" },
        ],
      },
      // ── 8. Icon modules hero ──────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/modules!.png", alt: "Icon modules overview", layout: "hero" },
        ],
      },
      // ── 9. Motion ─────────────────────────────────────────────────────────
      {
        label: "MOTION",
        title: "Nova Motion Guide",
        body: "Motion principles and timing curves applied across Nova's AI interactions — loading states, model response flows, and navigation transitions. Curves & timing set then applied as a reusable template.",
        images: [
          { src: "/images/amazon/Nova Motion Guide.png", alt: "Nova motion guide", layout: "editorial", radius: 32 },
        ],
      },
      // ── 10. Animation pair (GIFs, r16) ────────────────────────────────────
      {
        label: "ANIMATION",
        title: "Nova Catalog Animations",
        body: "Key interaction moments for model discovery, response, and navigation — produced as production-ready assets.",
        images: [
          { src: "/images/amazon/NFD_NCA1.gif", alt: "Nova catalog animation 1", layout: "pair-left", radius: 16 },
          { src: "/images/amazon/NFD_NCA2_1x.gif", alt: "Nova catalog animation 2", radius: 16 },
        ],
      },
      // ── 11. Second animation pair (GIFs, r16) ─────────────────────────────
      {
        images: [
          { src: "/images/amazon/NFD_EH1_1x.gif", alt: "Nova EH animation", layout: "pair-left", radius: 16 },
          { src: "/images/amazon/NFD_DR1.gif", alt: "Nova deep research animation", radius: 16 },
        ],
      },
      // ── 12. Builder Studio ────────────────────────────────────────────────
      {
        label: "BUILDER STUDIO",
        title: "Nova Builder Studio",
        body: "A CMS converting Quip documents directly to Nova Design System specs — enabling content publishing without design handoff. Designed, prototyped, and showcased at re:Invent.",
        images: [
          { src: "/images/amazon/Quip_CMS1.png", alt: "Quip CMS interface", layout: "editorial", radius: 32 },
        ],
      },
      // ── 13. CMS hero ──────────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/CMS_comp1.png", alt: "CMS component overview", layout: "hero" },
        ],
      },
      // ── 14. Template pair ─────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/1blank.png", alt: "Nova blank template", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/1blankb.png", alt: "Nova blank template B", radius: 32 },
        ],
      },
      // ── 15. Content Partners ──────────────────────────────────────────────
      {
        label: "CONTENT PARTNERS",
        title: "Amazon Content Partners",
        body: "Inherited an unshipped project, reworked the UX end-to-end, shipped v1 as sole designer. The platform connects Amazon's content partners with Nova's design and publishing tools.",
        images: [
          { src: "/images/amazon/2upBlack.png", alt: "Content partners 2-up dark", layout: "editorial", radius: 32 },
        ],
      },
      // ── 16. Content Partners pair ─────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/2upL_Black.png", alt: "Content partners large dark A", layout: "pair-left", radius: 32 },
          { src: "/images/amazon/2upLb_Black.png", alt: "Content partners large dark B", radius: 32 },
        ],
      },
      // ── 17. Nova Sonic ────────────────────────────────────────────────────
      {
        label: "NOVA SONIC",
        title: "Nova Sonic Audio Chat",
        body: "Designed UI/UX for Nova Sonic — Amazon's audio chat model. Contributed to model onboarding patterns: list views, edit/view forms, and field schemas across the Nova platform.",
        images: [
          { src: "/images/amazon/PLO Illustrtration_BLANK.png", alt: "Nova Sonic PLO illustration", layout: "hero" },
        ],
      },
      // ── 18. Alexa illustration pair ────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/Alexa_Faces_crooped.png", alt: "Alexa character illustration A", layout: "pair-left", radius: 32, blend: "multiply" },
          { src: "/images/amazon/Alexa_Faces_crooped2.png", alt: "Alexa character illustration B", radius: 32, blend: "multiply" },
        ],
      },
      // ── 19. Alexa KO editorial ────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/Alexa_Faces_KO.png", alt: "Alexa faces knockout", layout: "editorial", radius: 32 },
        ],
      },
      // ── 20. Prompt Inspiration ────────────────────────────────────────────
      {
        label: "PROMPT DESIGN",
        title: "Prompt Inspiration Cards",
        body: "Visual design for Nova's prompt inspiration system — cards guiding users toward effective model interactions. Shaped the overall look & feel of the Nova platform.",
        images: [
          { src: "/images/amazon/Prompt Inspiration Cards.png", alt: "Prompt inspiration cards", layout: "hero" },
        ],
      },
      // ── 21. EH animation editorial (GIF, r16) ────────────────────────────
      {
        images: [
          { src: "/images/amazon/NFD_EH12x.gif", alt: "Nova EH animation 2x", layout: "editorial", radius: 16 },
        ],
      },
      // ── 22. Alexa hero ────────────────────────────────────────────────────
      {
        images: [
          { src: "/images/amazon/Alexa_Faces_crooped3.png", alt: "Alexa character illustration C", layout: "hero" },
        ],
      },
      // ── 23. Final NCA animation (GIF, r16) ───────────────────────────────
      {
        images: [
          { src: "/images/amazon/NFD_NCA2.gif", alt: "Nova catalog animation final", layout: "editorial", radius: 16 },
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

