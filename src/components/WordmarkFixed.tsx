"use client";

/**
 * WordmarkFixed — the one true MISHA∆ wordmark.
 *
 * Normal state: renders in a position:fixed layer tracking a placeholder div.
 *
 * Brutal enter sequence:
 *   1. WordmarkFixed hides itself (opacity 0).
 *   2. The pill in SiteShell renders <WordmarkSVG color="white"/> as its actual
 *      content — so the SVG literally IS the button face.
 *   3. BrutalShadow pressed={true} → face at (0,0). Pill is visually pressed.
 *   4. Two frames later: pressed→false → BrutalShadow animates face to (+16,+16).
 *      SVG rides it as a real DOM child. No fixed-layer tricks needed.
 *   5. After transition settles: pill swaps back to <WordmarkPlaceholder>,
 *      WordmarkFixed re-appears (now black) at the correct settled position.
 */

import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from "react";

// ── Theme colors ──────────────────────────────────────────────────────────────
const THEME_COLOR: Record<string, string> = {
  default:   "#ffffff",
  brutalist: "#ffffff",   // white letters on blue pill
  gameboy:   "#383C83",
};
const DELTA_INNER: Record<string, string> = {
  default:   "#FFD132",   // yellow ring/outline
  brutalist: "#FFCE00",   // brutal yellow ring/outline
  gameboy:   "#C8A800",
};
const DELTA_OUTER: Record<string, string> = {
  default:   "#000000",   // black solid fill behind the ring
  brutalist: "#000000",   // black solid fill
  gameboy:   "#383C83",
};

// ── Jump timing ───────────────────────────────────────────────────────────────
const JUMP_DURATION  = 560;  // ms per letter arc
const STAGGER        = 35;   // ms between letters
const LETTER_COUNT   = 5;    // M i S H ∆
export const TOTAL_JUMP_MS   = JUMP_DURATION + (LETTER_COUNT - 1) * STAGGER;
export const THEME_FLIP_DELAY = Math.round(JUMP_DURATION * 0.48);

// ── Individual letter SVGs — all use currentColor so CSS can cross-fade ──────
function LetterM() {
  return (
    <svg width="38" height="32" viewBox="0 0 38 32" fill="none">
      <path d="M32.5562 27.5H26.3755L32.5562 16.793V27.5Z" fill="currentColor" stroke="currentColor" strokeWidth="9"/>
      <path d="M4.49951 27.5H10.6802L4.49951 16.793V27.5Z" fill="currentColor" stroke="currentColor" strokeWidth="9"/>
    </svg>
  );
}
function LetterI() {
  return (
    <svg width="9" height="32" viewBox="0 0 9 32" fill="none">
      <circle cx="4.459" cy="4.459" r="4.459" fill="currentColor"/>
      <rect y="12.59" width="8.918" height="19.41" fill="currentColor"/>
    </svg>
  );
}
function LetterS() {
  return (
    <svg width="16" height="32" viewBox="0 0 16 32" fill="none">
      <path d="M0 8C0 12.418 3.582 16 8 16V0C3.582 0 0 3.582 0 8Z" fill="currentColor"/>
      <path d="M15.724 24C15.724 19.582 12.142 16 7.724 16L7.724 32C12.142 32 15.724 28.418 15.724 24Z" fill="currentColor"/>
    </svg>
  );
}
function LetterH() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="10.667" height="10.667" fill="currentColor"/>
      <rect x="10.667" y="10.667" width="10.667" height="10.667" fill="currentColor"/>
      <rect y="21.333" width="10.667" height="10.667" fill="currentColor"/>
      <rect x="21.333" width="10.667" height="10.667" fill="currentColor"/>
      <rect x="21.333" y="21.333" width="10.667" height="10.667" fill="currentColor"/>
    </svg>
  );
}
// Delta uses two CSS custom properties: --wm-outer (triangle bg) and --wm-inner (cutout)
function LetterDelta() {
  return (
    <svg width="37" height="32" viewBox="0 0 37 32" fill="none">
      <path d="M18.475 0L36.95 32H0L18.475 0Z" fill="var(--wm-outer)"/>
      <path d="M36.95 32H0L18.476 0L36.95 32ZM10.393 26H26.558L18.475 12L10.393 26Z" fill="var(--wm-inner)"/>
    </svg>
  );
}

// ── WordmarkSVG — letters driven by CSS color + custom props on the container.
//    color      → sets CSS `color` → inherited by currentColor fills
//    deltaInner → --wm-inner CSS var
//    deltaOuter → --wm-outer CSS var
//    colorTransition → optional CSS transition string for cross-fade
export function WordmarkSVG({ color, deltaInner, deltaOuter, colorTransition, style }: {
  color: string;
  deltaInner: string;
  deltaOuter: string;
  colorTransition?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      aria-label="MiSH∆"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color,
        // @ts-expect-error — CSS custom properties
        "--wm-inner": deltaInner,
        "--wm-outer": deltaOuter,
        transition: colorTransition,
        ...style,
      }}
    >
      {[<LetterM key="m"/>,<LetterI key="i"/>,<LetterS key="s"/>,<LetterH key="h"/>,<LetterDelta key="d"/>].map((letter, i) => (
        <span key={i} data-wm-letter style={{ display:"inline-flex", transformOrigin:"bottom center" }}>
          {letter}
        </span>
      ))}
    </span>
  );
}

// ── WordmarkPlaceholder — invisible space-holder inside each theme's header ──
export function WordmarkPlaceholder({ innerRef }: { innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      ref={innerRef}
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        visibility: "hidden",
        // Matches WordmarkSVG: 38+9+16+32+37 = 132px letters + 4×6 = 24px gaps
        minWidth: 156,
        minHeight: 32,
      }}
    >
      <span style={{width:38,height:32,display:"inline-block"}}/>
      <span style={{width:9, height:32,display:"inline-block"}}/>
      <span style={{width:16,height:32,display:"inline-block"}}/>
      <span style={{width:32,height:32,display:"inline-block"}}/>
      <span style={{width:37,height:32,display:"inline-block"}}/>
    </div>
  );
}

// ── Handle ────────────────────────────────────────────────────────────────────
export interface WordmarkFixedHandle {
  jump: () => void;
  jumpOut: () => Promise<void>;  // hop up + fade out, resolves when all letters gone
  jumpIn: () => void;            // descend from above + fade in, staggered
  syncPos: () => void;
}

// ── WordmarkFixed ─────────────────────────────────────────────────────────────
interface WordmarkFixedProps {
  placeholderRef: React.RefObject<HTMLDivElement | null>;
  theme: string;
  /** True while brutal enter is in-progress — fixed layer hides itself */
  hidden?: boolean;
}

const WordmarkFixed = forwardRef<WordmarkFixedHandle, WordmarkFixedProps>(
  function WordmarkFixed({ placeholderRef, theme, hidden }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rafRef       = useRef<number | null>(null);

    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const frozenPos = useRef<{ top: number; left: number } | null>(null);
    const [chatHidden, setChatHidden] = useState(false);

    const color      = THEME_COLOR[theme] ?? "#ffffff";
    const deltaInner = DELTA_INNER[theme] ?? "#FFD132";
    const deltaOuter = DELTA_OUTER[theme] ?? "#1B6EF3";

    // ── Track placeholder ───────────────────────────────────────────────────
    const syncPos = useCallback(() => {
      const el = placeholderRef.current;
      if (!el) return; // keep last known pos
      const rect = el.getBoundingClientRect();
      const p = { top: rect.top, left: rect.left };
      frozenPos.current = p;
      setPos(p);
    }, [placeholderRef]);

    useEffect(() => {
      syncPos();
      const observer = new ResizeObserver(syncPos);
      const el = placeholderRef.current;
      if (el) observer.observe(el);
      observer.observe(document.body);
      window.addEventListener("resize", syncPos);
      window.addEventListener("scroll", syncPos, { passive: true });
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", syncPos);
        window.removeEventListener("scroll", syncPos);
      };
    }, [syncPos]);

    // ── Jump ────────────────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      syncPos,

      jumpOut() {
        // Each letter: hop up + fade out at peak. Resolves when last letter fades.
        const spans = containerRef.current
          ? Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-wm-letter]"))
          : [];
        spans.forEach(el => el.getAnimations().forEach(a => a.cancel()));
        spans.forEach((el, i) => {
          el.animate([
            { transform: "translateY(0px)   scaleY(1)",   opacity: 1, offset: 0    },
            { transform: "translateY(-8px)  scaleY(1.03)", opacity: 1, offset: 0.25 },
            { transform: "translateY(-24px) scaleY(1.1)",  opacity: 0, offset: 0.65 },
            { transform: "translateY(-24px) scaleY(1.1)",  opacity: 0, offset: 1    },
          ], {
            duration: 380,
            delay: i * STAGGER,
            easing: "ease-in",
            fill: "both",
          });
        });
        return new Promise<void>(resolve => {
          setTimeout(() => {
            setChatHidden(true);
            resolve();
          }, 380 + (spans.length - 1) * STAGGER);
        });
      },

      jumpIn() {
        // Restore pos from frozen, make visible, then descend + fade in per letter.
        if (frozenPos.current) setPos(frozenPos.current);
        setChatHidden(false);
        // Wait one frame for the component to mount/show, then animate
        requestAnimationFrame(() => {
          const spans = containerRef.current
            ? Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-wm-letter]"))
            : [];
          spans.forEach(el => el.getAnimations().forEach(a => a.cancel()));
          spans.forEach((el, i) => {
            el.animate([
              { transform: "translateY(-24px) scaleY(1.1)",  opacity: 0, offset: 0    },
              { transform: "translateY(-24px) scaleY(1.1)",  opacity: 0, offset: 0.25 },
              { transform: "translateY(-8px)  scaleY(1.03)", opacity: 1, offset: 0.6  },
              { transform: "translateY(0px)   scaleY(1)",    opacity: 1, offset: 1    },
            ], {
              duration: 400,
              delay: i * STAGGER,
              easing: "ease-out",
              fill: "both",
            });
          });
        });
      },

      jump() {
        // Animate each direct child span of the container
        const spans = containerRef.current
          ? Array.from(containerRef.current.querySelectorAll<HTMLElement>("[data-wm-letter]"))
          : [];
        spans.forEach(el => el.getAnimations().forEach(a => a.cancel()));
        spans.forEach((el, i) => {
          el.animate([
            { transform: "translateY(0px)    scaleY(1)",    offset: 0    },
            { transform: "translateY(-4px)   scaleY(1.02)", offset: 0.12 },
            { transform: "translateY(-22px)  scaleY(1.08)", offset: 0.30 },
            { transform: "translateY(-24px)  scaleY(1.1)",  offset: 0.45 },
            { transform: "translateY(-24px)  scaleY(1.1)",  offset: 0.68 },
            { transform: "translateY(-8px)   scaleY(1.04)", offset: 0.85 },
            { transform: "translateY(0px)    scaleY(1)",    offset: 1    },
          ], {
            duration: JUMP_DURATION,
            delay: i * STAGGER,
            easing: "ease-in-out",
            fill: "both",
          });
        });
      },
    }));

    if (!pos) return null;

    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top:  pos.top,
          left: pos.left,
          zIndex: 200,
          pointerEvents: "none",
          opacity: (hidden || chatHidden) ? 0 : 1,
        }}
      >
        <WordmarkSVG
          color={color}
          deltaInner={deltaInner}
          deltaOuter={deltaOuter}
          colorTransition="color 200ms ease, --wm-inner 200ms ease, --wm-outer 200ms ease"
        />
      </div>
    );
  }
);

export default WordmarkFixed;
