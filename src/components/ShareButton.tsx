"use client";

import { useEffect, useRef, useState } from "react";
import Icon, { type IconSize } from "@/components/Icon";

const COPIED_MS = 1500;

/**
 * Shared share behavior for every theme.
 * - Native share sheet where the browser has one (phones, Safari).
 * - Otherwise copies the link and flips to a "copied" state for 1.5s.
 */
export function useShare(url?: string, title?: string) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function share() {
    // Accepts absolute URLs or site paths like "/funko" or "/?about=rpg"
    const u = url ? new URL(url, window.location.origin).href : window.location.href;
    const t = title ?? document.title;
    if (navigator.share) {
      try { await navigator.share({ title: t, url: u }); } catch { /* user closed the sheet */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(u);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch { /* clipboard blocked — nothing to confirm */ }
  }

  return { copied, share };
}

type ShareButtonProps = {
  url?: string;
  title?: string;
  /** "round" = resume-tile treatment (Standard/GB). "bare" = caller supplies the look (Brutal bc-cta). */
  variant?: "round" | "bare";
  className?: string;
  style?: React.CSSProperties;
  /** Defaults to L. Icon-only 64px Brutalist cells pass XL. */
  iconSize?: IconSize;
  /** Optional text label shown before the icon, e.g. "SHARE" → "COPIED". */
  label?: string;
};

export default function ShareButton({
  url, title, variant = "round", className, style, iconSize, label,
}: ShareButtonProps) {
  const { copied, share } = useShare(url, title);

  const round: React.CSSProperties = {
    width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
    background: "#fff", border: "1px solid #000", color: "#000",
    boxShadow: "4px 4px 16px 0px rgba(0,0,0,0.16)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", padding: 0,
  };
  const bare: React.CSSProperties = { cursor: "pointer", font: "inherit" };

  return (
    <button
      type="button"
      className={className}
      aria-label={copied ? "Link copied" : "Share"}
      onClick={e => { e.stopPropagation(); share(); }}
      style={{ ...(variant === "round" ? round : bare), ...style }}
    >
      {label && <span>{copied ? "COPIED" : label}</span>}
      <Icon name={copied ? "check" : "share"} size={iconSize ?? "L"} />
      {/* Announces the copy for screen readers */}
      <span aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {copied ? "Link copied" : ""}
      </span>
    </button>
  );
}
