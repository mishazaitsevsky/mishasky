"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1.25rem 2rem",
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        mixBlendMode: "multiply",
      }}
    >
      <Link
        href="/"
        style={{
          opacity: isHome ? 0 : 1,
          pointerEvents: isHome ? "none" : "auto",
          transition: "opacity 0.2s",
        }}
      >
        MiSHA
      </Link>

      <Link href="/about" style={{ opacity: 0.5 }}>
        About
      </Link>
    </nav>
  );
}
