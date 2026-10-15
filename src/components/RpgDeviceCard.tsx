"use client";

/**
 * RpgDeviceCard — the RPG quiz card rendered as a gameboy-style device
 * for the standard (non-gameboy) home page theme.
 *
 * Matches Figma node 827:2862:
 *   - Top bar: cartridge slot (notch + rails)
 *   - Body: warm grey (#D9D4CF) with inner light glow
 *   - Screen: green (#889D58) with gameboy inner shadows, FIT RPG eyebrow + title
 *   - Bottom: PLAY + ABOUT buttons with grey pill press-style
 */

import Image from "next/image";

const BODY   = "#D9D4CF";
const BODY2  = "#C6C2BE"; // darker rail
const SCREEN = "#889D58";
const INK    = "#3A4324";
const BLUE   = "#383C83";

interface RpgDeviceCardProps {
  onPlay?:  () => void;
  onAbout?: () => void;
}

// ── Pill button ───────────────────────────────────────────────────────────────
function PillButton({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
      <span style={{ fontFamily: '"T-Star Mono",monospace', fontWeight: 700, fontSize: 30, lineHeight: "36px", color: BLUE }}>
        {label}
      </span>
      <div
        onClick={onClick}
        style={{
          width: "100%", height: 64, borderRadius: 100,
          background: "rgba(0,0,0,0.1)",
          border: "1px solid transparent",
          boxShadow: "4px 4px 16px rgba(0,0,0,0.16), inset 8px 12px 14px rgba(0,0,0,0.1), inset 0 0 3px rgba(0,0,0,0.25)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Pressed pill surface */}
        <div style={{
          width: "calc(100% - 8px)", height: 33, borderRadius: 100,
          background: "radial-gradient(circle at 87% 80%, rgba(206,200,206,0.3) 0%, rgba(129,123,129,0.3) 100%), linear-gradient(0deg, rgba(190,180,190,0.4) 50%, rgba(111,106,111,0.4) 100%)",
          boxShadow: "1px 1px 2px rgba(0,0,0,0.7), inset 8px 12px 14px rgba(0,0,0,0.1), inset 0 0 3px rgba(0,0,0,0.25)",
        }}/>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function RpgDeviceCard({ onPlay, onAbout }: RpgDeviceCardProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      filter: "drop-shadow(16px 16px 32px rgba(0,0,0,0.45))",
      width: "100%",
    }}>

      {/* ── TOP BAR — cartridge slot ─────────────────────────────── */}
      <div style={{
        display: "flex", flexDirection: "row", alignItems: "stretch",
        height: 40, borderRadius: "24px 4px 0 4px",
      }}>
        {/* Left ear */}
        <div style={{ width: 36, background: BODY, borderRadius: "24px 4px 0 4px", flexShrink: 0 }}/>

        {/* Left separator */}
        <div style={{ width: 8, background: BODY2, boxShadow: "inset 2px 2px 2px rgba(0,0,0,0.25)", flexShrink: 0 }}/>

        {/* Center top — cartridge pill */}
        <div style={{
          flex: 1,
          background: BODY,
          boxShadow: "inset 0 8px 4px rgba(255,242,199,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          borderRadius: "4px 4px 0 0",
          paddingTop: 4,
        }}>
          <div style={{
            width: 72, height: 20, borderRadius: 100,
            background: "#BEBBB6",
            boxShadow: "4px 4px 16px rgba(0,0,0,0.1), inset 8px 8px 16px rgba(0,0,0,0.1)",
          }}/>
        </div>

        {/* Right separator */}
        <div style={{ width: 8, background: BODY2, boxShadow: "inset 2px 2px 2px rgba(0,0,0,0.25)", flexShrink: 0 }}/>

        {/* Right ear */}
        <div style={{ width: 36, background: BODY, borderRadius: "4px 24px 0 4px", boxShadow: "inset -8px 0 8px rgba(184,181,192,1)", flexShrink: 0 }}/>
      </div>

      {/* Groove under top bar */}
      <div style={{ height: 4, background: BODY2, boxShadow: "inset 0 2px 2px rgba(0,0,0,0.25)", margin: "0 8px" }}/>

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(125deg, ${BODY} 0%, ${BODY} 87%, #C4C0BB 91%, #B4BABB 100%)`,
        boxShadow: "32px 32px 64px rgba(0,0,0,0.5), inset 16px 8px 8px rgba(255,242,199,0.25), inset -8px -8px 16px rgba(56,60,131,0.25)",
        borderRadius: "4px 4px 32px 32px",
        padding: "32px 0 24px",
        display: "flex", flexDirection: "column", gap: 0,
      }}>

        {/* Screen + content */}
        <div style={{ padding: "0 32px", display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Screen */}
          <div style={{
            borderRadius: 32,
            padding: 32,
            background: SCREEN,
            border: "1px solid rgba(255,255,255,0.6)",
            boxShadow: "inset 8px 8px 16px rgba(56,60,131,0.36), inset -8px -8px 16px rgba(151,149,74,1)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {/* FIT RPG eyebrow + title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, boxShadow: "2px 2px 1px rgba(58,67,36,0.15)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, alignSelf: "flex-start" }}>
                <span style={{ fontFamily: '"T-Star Mono",monospace', fontWeight: 700, fontSize: 12, letterSpacing: "0.4em", color: INK, display: "inline-block", borderBottom: `1px solid ${INK}`, paddingBottom: 4 }}>
                  FIT RPG
                </span>
              </div>
              <h2 style={{ fontFamily: '"T-Star Mono",monospace', fontWeight: 700, fontSize: 30, lineHeight: "39px", color: INK, margin: 0 }}>
                Interactive Role Preference Guide (R.P.G.)
              </h2>
            </div>

            {/* Logo */}
            <div style={{ width: 64, height: 64 }}>
              <Image src="/icons/rpg-logo.svg" width={64} height={64} alt="RPG logo" style={{ display: "block", filter: `brightness(0) saturate(100%) invert(22%) sepia(9%) saturate(1800%) hue-rotate(51deg) brightness(90%) contrast(90%)` }}/>
            </div>
          </div>

          {/* PLAY + ABOUT buttons */}
          <div style={{
            display: "flex", flexDirection: "row", alignItems: "flex-end",
            gap: 8, paddingBottom: 8,
          }}>
            <PillButton label="PLAY"  onClick={onPlay}  />
            <PillButton label="ABOUT" onClick={onAbout} />
          </div>

        </div>
      </div>

      {/* ── BOTTOM TAB ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ width: 32, flexShrink: 0 }}/>
        <div style={{ flex: 1, height: 16, borderRadius: "0 0 8px 8px", background: BODY }}/>
      </div>

    </div>
  );
}
