import Nav from "@/components/Nav";
import ResumeSection from "@/components/ResumeSection";
import Link from "next/link";

export const metadata = {
  title: "About — Misha Zaitsevsky",
};

const SECTIONS = [
  {
    numeral: "I",
    title: "What's this site for?",
    body: [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    ],
  },
  {
    numeral: "II",
    title: "Why obsessed with role finding?",
    body: [
      "Sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.",
      "Et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    ],
  },
  {
    numeral: "III",
    title: "How was this site made?",
    body: [
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa.",
      "Qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    ],
  },
  {
    numeral: "IV",
    title: "Who am I?",
    body: [
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit. Ut labore et dolore magnam aliquam quaerat voluptatem.",
    ],
  },
  {
    numeral: "V",
    title: "Blog",
    body: [
      "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.",
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
    ],
  },
];

export default function About() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)", minHeight: "100vh", fontFamily: "var(--font-mono)" }}>
      <Nav />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "8rem 2rem 6rem" }}>

        {/* Page eyebrow */}
        <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.4, marginBottom: "4rem" }}>
          About
        </div>

        <ResumeSection />

        {/* Sections */}
        {SECTIONS.map((sec, i) => (
          <section
            key={sec.numeral}
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "2.5rem",
              paddingBottom: "2.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: i < SECTIONS.length - 1 ? 0 : "4rem",
            }}
          >
            {/* Numeral eyebrow */}
            <div style={{
              fontSize: "0.65rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              opacity: 0.35,
              fontFamily: "var(--font-mono)",
            }}>
              {sec.numeral}
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)",
              fontWeight: "normal",
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
              margin: 0,
            }}>
              {sec.title}
            </h2>

            {/* Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem" }}>
              {sec.body.map((para, pi) => (
                <p key={pi} style={{ fontSize: "0.85rem", lineHeight: 1.9, opacity: 0.65, margin: 0 }}>
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}

        {/* Footer links */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", display: "flex", gap: "2rem", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <a href="mailto:hello@mishasky.net" style={{ opacity: 0.5 }}>Email</a>
          <a href="https://linkedin.com/in/mishasky" target="_blank" rel="noopener noreferrer" style={{ opacity: 0.5 }}>LinkedIn</a>
        </div>

        <div style={{ marginTop: "3rem" }}>
          <Link href="/" style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.3 }}>
            ← Work
          </Link>
        </div>

      </main>
    </div>
  );
}
