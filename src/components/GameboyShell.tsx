"use client";
import Icon from "@/components/Icon";
import React from "react";
import Image from "next/image";
import type { Project } from "@/lib/projects";
import { END_COPY, summarizePath } from "@/lib/dialogue";
import { TreeReveal, QuipTyper } from "@/components/SiteShell";
import JA from "@/lib/ja";
import { WordmarkPlaceholder } from "@/components/WordmarkFixed";

function ArrowRight({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ transform:"rotate(90deg)", flexShrink:0 }} aria-hidden="true">
      <path d="M21.25 10.543L12.104 1.397C11.909 1.201 11.592 1.201 11.397 1.397L2.25 10.543M11.75 1.25V22.043"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

const BODY_BG = "linear-gradient(160deg, #D9D4CF 0%, #D9D4CF 70%, #C4C0BB 88%, #B4BABB 100%)";

// ── Wordmark (same as main site) ──────────────────────────────────────────────
function Wordmark() {
  const c = "#383C83";
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
      <svg width="43" height="36" viewBox="0 0 38 32" fill="none"><path d="M32.5562 27.5H26.3755L32.5562 16.793V27.5Z" fill={c} stroke={c} strokeWidth="9"/><path d="M4.49951 27.5H10.6802L4.49951 16.793V27.5Z" fill={c} stroke={c} strokeWidth="9"/></svg>
      <svg width="10" height="36" viewBox="0 0 9 32" fill="none"><circle cx="4.459" cy="4.459" r="4.459" fill={c}/><rect y="12.59" width="8.918" height="19.41" fill={c}/></svg>
      <svg width="18" height="36" viewBox="0 0 16 32" fill="none"><path d="M0 8C0 12.418 3.582 16 8 16V0C3.582 0 0 3.582 0 8Z" fill={c}/><path d="M15.724 24C15.724 19.582 12.142 16 7.724 16L7.724 32C12.142 32 15.724 28.418 15.724 24Z" fill={c}/></svg>
      <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect width="10.667" height="10.667" fill={c}/><rect x="10.667" y="10.667" width="10.667" height="10.667" fill={c}/><rect y="21.333" width="10.667" height="10.667" fill={c}/><rect x="21.333" width="10.667" height="10.667" fill={c}/><rect x="21.333" y="21.333" width="10.667" height="10.667" fill={c}/></svg>
      <svg width="42" height="36" viewBox="0 0 37 32" fill="none"><path d="M18.475 0L36.95 32H0L18.475 0Z" fill={c}/><path d="M36.95 32H0L18.476 0L36.95 32ZM10.393 26H26.558L18.475 12L10.393 26Z" fill="#C8A800"/></svg>
    </span>
  );
}

// ── LED ───────────────────────────────────────────────────────────────────────
function LED({ blinking = false }: { blinking?: boolean }) {
  return (
    <div style={{ width:24, height:24, flexShrink:0, position:"relative" }}>
      {blinking && (
        <style>{`@keyframes led-heartbeat{0%{opacity:0.15}25%{opacity:1}100%{opacity:0.15}}`}</style>
      )}
      <div style={{
        width:24, height:24, borderRadius:"50%",
        background:"#414141", border:"1px solid #000",
        position:"absolute", inset:0,
      }}/>
      <div style={{
        position:"absolute", inset:0, borderRadius:"50%",
        background:"radial-gradient(circle at 50% 50%, #fff 1%, #ff0000 28%, rgba(255,0,0,0) 100%)",
        boxShadow:"0 0 12px 4px rgba(255,60,60,0.8)",
        animation: blinking ? "led-heartbeat 800ms cubic-bezier(0.5,0,0.85,1) infinite" : "none",
      }}/>
    </div>
  );
}

// ── Round nav/ABC button — empty circle, icon/label below ────────────────────
function GameboyButton({ sublabel, icon, active, dimmed, onClick, hideLabel }: {
  sublabel: string; icon?: React.ReactNode;
  active?: boolean; dimmed?: boolean; onClick?: () => void; hideLabel?: boolean;
}) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,cursor:"pointer"}} onClick={onClick}>
      <div style={{
        width:64, height:64, borderRadius:"50%", position:"relative",
        background: active
          ? "linear-gradient(180deg, #7a1a3a 0%, #3a0a20 95%)"
          : "linear-gradient(180deg, #A03469 0%, #622040 95%)",
        boxShadow: active ? [
          "4px 4px 5px rgba(0,0,0,0.44)",
          "2px 2px 1px rgba(0,0,0,1.0)",
          "-2px -2px 4px rgba(137,44,90,0.20)",
          "inset 8px 12px 14px rgba(0,0,0,0.10)", // pressed inner shadow
        ].join(", ") : [
          "4px 4px 5px rgba(0,0,0,0.44)",
          "2px 2px 1px rgba(0,0,0,1.0)",
          "-2px -2px 4px rgba(137,44,90,0.20)",
        ].join(", "),
        flexShrink:0,
      }}>
        {/* buttontop3 — flipped diagonally on press */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/buttontop3.svg" alt="" aria-hidden="true" style={{
          position:"absolute", top:0, left:0,
          pointerEvents:"none", zIndex:2,
          transform: active ? "rotate(180deg)" : "none",
          transformOrigin: "center center",
        }}/>
      </div>
      {/* Icon if provided, otherwise sublabel (A/B/C for chat) */}
      {!hideLabel && (icon
        ? <span style={{color:dimmed?"rgba(56,60,131,0.35)":"#383C83"}}>{icon}</span>
        : <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:500,fontSize:32,color:dimmed?"rgba(56,60,131,0.35)":"#383C83",textTransform:"uppercase",lineHeight:1}}>{sublabel}</span>
      )}
    </div>
  );
}

// ── NextButton — stroke default, fill+invert on hover, ghost-safe ────────────
function NextButton({ selected, onConfirm }: { selected: boolean; onConfirm: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={selected ? onConfirm : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: (selected && hovered) ? "#3A4324" : "transparent",
        border: "1px solid #3A4324",
        fontFamily:'"T-Star Mono",monospace',
        fontSize:30, fontWeight:300,
        color: (selected && hovered) ? "#889D58" : "#3A4324",
        opacity: selected ? 1 : 0.25,
        cursor: selected ? "pointer" : "default",
        height:48, lineHeight:"48px",
      padding:"0 16px",
        transition:"background 0.12s, color 0.12s",
      }}
    >
      <ArrowRight size={22}/>
    </button>
  );
}

// ── Recessed pill (Select/Quit/Back) ─────────────────────────────────────────
const PILL_STROKE = "conic-gradient(from 315deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0) 15%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.36) 42%, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 69%, rgba(0,0,0,0) 80%, rgba(0,0,0,0) 100%)";

function ControlPill({ sublabel, icon, onClick, secondary }: { sublabel: string; icon?: React.ReactNode; onClick?: () => void; secondary?: boolean }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20,cursor:"pointer"}}
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* Same 1px conic-gradient sandwich as A/B/C container */}
      <div style={{
        background: PILL_STROKE,
        borderRadius: 100,
        padding: 1,
        display: "inline-flex",
      }}>
        <div style={{
          height: 46,
          borderRadius: 100,
          background: "linear-gradient(160deg, #D9D4CF 0%, #C4C0BB 100%)",
          boxShadow: [
            "4px 4px 16px rgba(0,0,0,0.16)",
            "inset 8px 8px 16px rgba(0,0,0,0.10)",
          ].join(", "),
          display:"flex", alignItems:"center", justifyContent:"center",
          padding: "0 8px",
        }}>
          <div style={{
            background: PILL_STROKE,
            borderRadius: 100,
            padding: 1,
            display: "inline-flex",
          }}>
            <div style={{
              width:98, height:30, borderRadius:100,
              background:"linear-gradient(180deg, #BEB4BE 0%, #6F6A6F 100%)",
              boxShadow: pressed
                ? "inset 4px 4px 8px rgba(0,0,0,0.3)"
                : "1px 1px 2px rgba(0,0,0,0.7), inset 8px 12px 14px rgba(0,0,0,0.1), inset 0 0 3px rgba(0,0,0,0.25)",
              transition:"box-shadow 0.08s ease",
            }}/>
          </div>
        </div>
      </div>
      <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:secondary?300:500,fontSize:32,color:"#383C83",textTransform:"uppercase",lineHeight:1}}>{icon ?? sublabel}</span>
    </div>
  );
}

// ── Arrow/confirm pill — same housing as ControlPill ─────────────────────────
function ArrowButton({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:30,cursor:active?"pointer":"default"}} onClick={active?onClick:undefined}>
      <div style={{
        background: PILL_STROKE,
        borderRadius: 100,
        padding: 1,
        display: "inline-flex",
        opacity: active ? 1 : 0.5,
        transition: "opacity .12s",
      }}>
        <div style={{
          height: 46,
          borderRadius: 100,
          background: "linear-gradient(160deg, #D9D4CF 0%, #C4C0BB 100%)",
          boxShadow: [
            "4px 4px 16px rgba(0,0,0,0.16)",
            active ? "inset 8px 8px 16px rgba(0,0,0,0.10)" : "inset 4px 4px 8px rgba(0,0,0,0.3)",
          ].join(", "),
          display:"flex", alignItems:"center", justifyContent:"center",
          padding: "0 8px",
        }}>
          <div style={{
            background: PILL_STROKE,
            borderRadius: 100,
            padding: 1,
            display: "inline-flex",
          }}>
            <div style={{
              width:98, height:30, borderRadius:100,
              background:"linear-gradient(180deg, #BEB4BE 0%, #6F6A6F 100%)",
              boxShadow:"1px 1px 2px rgba(0,0,0,0.7), inset 8px 12px 14px rgba(0,0,0,0.1), inset 0 0 3px rgba(0,0,0,0.25)",
            }}/>
          </div>
        </div>
      </div>
      <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:500,fontSize:30,color:"#383C83",textTransform:"uppercase",lineHeight:1,opacity:active?1:0.5}}>Next</span>
    </div>
  );
}

// ── LCD screen ────────────────────────────────────────────────────────────────
function Screen({ children, overlay }: { children: React.ReactNode; overlay?: React.ReactNode }) {
  const screenStyle: React.CSSProperties = {
    background:"#889D58",
    boxShadow:"inset 1px 1px 0 rgba(255,255,255,0.6), inset 8px 8px 16px rgba(56,60,131,0.36), inset -8px -8px 16px rgba(151,149,74,1)",
    padding:"16px 20px",
    fontFamily:'"T-Star Mono",monospace',
    color:"#3A4324", fontSize:30, fontWeight:300, lineHeight:1.2,
    flex:1, minHeight:300,
  };
  return (
    <div style={{ position:"relative", flex:1, minHeight:300 }}>
      {/* Real content — drop-shadow replaces the old ghost copy */}
      <div className="gb-screen-content" style={{ ...screenStyle, filter:"drop-shadow(2px 2px 1px rgba(58,67,36,0.15))" }}>
        {children}
      </div>
      {/* Overlay slot */}
      {overlay && (
        <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none" }}>
          <div style={{ position:"absolute", bottom:16, left:20, pointerEvents:"auto", display:"inline-flex" }}>
            {overlay}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cartridge card — 3-part anatomy ──────────────────────────────────────────
// TOP: 8px radius TL/TR, 32px frame, side rails, triangle notch, image
// MID: 8px radius BL only, shadow bars + VIEW pill
// BOTTOM TAB: 32px left indent, 8px radius BL/BR
function GameboyCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const bodyBg = "linear-gradient(125deg, #D9D4CF 0%, #D9D4CF 87%)";
  const railShadow = "inset 0 2px 2px rgba(0,0,0,0.2), inset 0 -1px 1px rgba(255,255,255,0.5)";

  // Side rail: 8px bar (two pieces) + 24px bar
  const SideRail = () => (
    <div style={{display:"flex",flexDirection:"column",width:32,flexShrink:0}}>
      {/* 8px top piece */}
      <div style={{flex:1,background:bodyBg,boxShadow:railShadow}}/>
    </div>
  );

  return (
    <button onClick={onClick} className="gb-card-btn" style={{background:"none",border:"none",padding:0,cursor:"pointer",width:"100%",textAlign:"left",display:"flex",flexDirection:"column",
      filter:"drop-shadow(16px 16px 24px rgba(0,0,0,0.5))", position:"relative"}}>

      {/* ── TOP SECTION ── */}
      <div style={{borderRadius:"8px 8px 0 0",background:"#D9D4CF",display:"flex",flexDirection:"row",alignItems:"stretch"}}>
        {/* Left rail: outer(8px) | inner-separator(8px) | inner-pad(24px) */}
        <div style={{width:40,flexShrink:0,display:"flex",flexDirection:"row",alignItems:"stretch"}}>
          {/* Outer 8px — top fill white (radius TL), bottom 64px #D9D4CF */}
          <div style={{width:8,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:"#fff",borderRadius:"8px 0 0 0"}}/>
            <div style={{height:64,background:"#D9D4CF"}}/>
          </div>
          {/* Inner separator 8px — same split */}
          <div style={{width:8,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:"#D9D4CF",borderRadius:0}}/>
            <div style={{height:64,background:"#D9D4CF"}}/>
          </div>
          {/* Inner pad 24px */}
          <div style={{width:24,background:"#D9D4CF"}}/>
        </div>

        {/* Image column — triangle notch top-center, then image */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          {/* Triangle notch — inlined SVG so multiply blend works against card bg */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:32,background:"#D9D4CF"}}>
            <svg width="31" height="21" viewBox="0 0 31 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g opacity="0.7" filter="url(#filter0_i)" style={{mixBlendMode:"multiply"}}>
                <path d="M13.0565 1.07449C14.2557 -0.358446 16.4588 -0.358446 17.6579 1.07448L30.0093 15.8341C31.6435 17.787 30.255 20.7594 27.7086 20.7594H3.00585C0.459436 20.7594 -0.929048 17.787 0.705154 15.8341L13.0565 1.07449Z" fill="#F3F3F7"/>
                <path d="M13.0565 1.07449C14.2557 -0.358446 16.4588 -0.358446 17.6579 1.07448L30.0093 15.8341C31.6435 17.787 30.255 20.7594 27.7086 20.7594H3.00585C0.459436 20.7594 -0.929048 17.787 0.705154 15.8341L13.0565 1.07449Z" fill="black" fillOpacity="0.1"/>
              </g>
              <defs>
                <filter id="filter0_i" x="0" y="0" width="32.7144" height="22.7598" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dx="2" dy="2"/>
                  <feGaussianBlur stdDeviation="2"/>
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
                </filter>
              </defs>
            </svg>
          </div>
          {/* Image — 16px radius, angular conic stroke */}
          <div style={{position:"relative",paddingBottom:"100%",flex:1}}>
            <div style={{
              position:"absolute",inset:0,borderRadius:16,overflow:"hidden",
              outline:"2px solid transparent",
              background:"conic-gradient(from 183deg at 50% 50%, #FFFFFF 2%, #D4D4D4 5%, #C8C4C4 25%, #999999 29%, #BBBBBB 51%, #E5E5E5 55%, #E9E9E9 76%, #FFFFFF 79%)",
            }}>
              <div style={{position:"absolute",inset:2,borderRadius:14,overflow:"hidden",background:project.thumbBg}}>
                {project.thumb && <Image src={project.thumbGameboy ?? project.thumb} alt={project.client} fill sizes="33vw" unoptimized={(project.thumbGameboy ?? project.thumb).endsWith(".gif")} style={{objectFit:"cover",objectPosition:"center",mixBlendMode:(project.thumbBlend as React.CSSProperties["mixBlendMode"]) ?? undefined}}/>}
                <div style={{position:"absolute",inset:0,padding:"12px 14px",display:"flex",flexDirection:"column",gap:4}}>
                  {project.gbStyle && !project.thumb && (
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",width:"100%",height:"100%",color:"#3A4324",filter:"drop-shadow(2px 2px 1px rgba(58,67,36,0.15))"}}>
                      <Icon name="quiz" size={150}/>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: inner-pad(24px) | inner-separator(8px) | outer(8px) — mirrored */}
        <div style={{width:40,flexShrink:0,display:"flex",flexDirection:"row",alignItems:"stretch"}}>
          {/* Inner pad 24px */}
          <div style={{width:24,background:"#D9D4CF"}}/>
          {/* Inner separator 8px */}
          <div style={{width:8,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:"#D9D4CF"}}/>
            <div style={{height:64,background:"#D9D4CF"}}/>
          </div>
          {/* Outer 8px — top fill rgba(0,0,0,0.2) (radius TR), bottom 64px #D9D4CF */}
          <div style={{width:8,display:"flex",flexDirection:"column"}}>
            <div style={{flex:1,background:"rgba(0,0,0,0.2)",borderRadius:"0 8px 0 0"}}/>
            <div style={{height:64,background:"#D9D4CF"}}/>
          </div>
        </div>

      </div>

      {/* ── MID SECTION ── */}
      <div style={{background:"#D9D4CF",borderRadius:"0 0 0 8px"}}>
        {/* Lines + CTA stack with 32px top/bottom margin */}
        <div style={{margin:"32px 0",position:"relative"}}>
          {/* 5 × 8px shadow bars with 8px gap */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                height:8,
                background:"#D9D4CF",
                boxShadow:"inset 0 2px 3px rgba(0,0,0,0.18), inset 0 -1px 1px rgba(255,255,255,0.5)",
              }}/>
            ))}
          </div>
          {/* CTA — 64px tall, spans center column width (full width minus rails) */}
          <div style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:2,
            padding:"0 40px", /* match rail width so pill spans image width */
          }}>
            <div style={{
              width:"100%", height:64, borderRadius:100,
              background:"#E8E4DF",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"2px 2px 8px rgba(0,0,0,0.2), inset 2px 4px 8px rgba(0,0,0,0.12), inset -2px -2px 6px rgba(255,255,255,0.7)",
            }}>
              <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:700,fontSize:30,letterSpacing:"0.2em",color:"#383C83"}}>{project.ctaLabel ?? "VIEW"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TAB ── 32px left transparent gap, then filled bar */}
      <div style={{display:"flex",flexDirection:"row"}}>
        <div style={{width:32,flexShrink:0}}/>
        <div style={{flex:1,height:16,borderRadius:"0 0 8px 8px",background:"#D9D4CF"}}/> 
      </div>

    </button>
  );
}

// ── D-Pad ─────────────────────────────────────────────────────────────────────
// Base: PNG cross shape (d_pad_base), 200×200, fill #2F3030, 8px radius corners
// 4px outer stroke (dark), 2 inset shadows (bright TL + dark BR bevel)
// Left arm + right arm: each 3 pills 48h×12w, gap 8, vertically centered
// Center: 55px sphere
function DPad() {
  // 3 pills side by side: 3×12 + 2×8 = 52px wide, 48px tall
  const PillGroup = () => (
    <div style={{
      display: "flex", flexDirection: "row", gap: 8, alignItems: "center",
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 12, height: 48, borderRadius: 6, flexShrink: 0,
          background: "#222222",
          boxShadow: "inset 2px 2px 3px rgba(255,255,255,0.12), inset -2px -2px 3px rgba(0,0,0,0.8)",
        }}/>
      ))}
    </div>
  );

  return (
    <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
      {/* Base cross PNG — provides the shape */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/Dpad_pad_base.png"
        alt=""
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />

      {/* Left pill group — centred vertically in the horizontal arm (~33%–67% of height) */}
      <div style={{
        position: "absolute",
        top: "50%", left: 16,
        transform: "translateY(-50%)",
      }}>
        <PillGroup />
      </div>

      {/* Right pill group */}
      <div style={{
        position: "absolute",
        top: "50%", right: 16,
        transform: "translateY(-50%)",
      }}>
        <PillGroup />
      </div>

      {/* Center sphere — 55px */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 55, height: 55, borderRadius: "50%",
        background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.0) 55%), radial-gradient(circle at 62% 68%, rgba(255,255,255,0.18) 0%, transparent 45%), #1A1A1A",
        boxShadow: "inset 6px 10px 18px rgba(0,0,0,0.85), inset -3px -3px 8px rgba(255,255,255,0.08)",
      }}/>
    </div>
  );
}

// ── Top Bar ───────────────────────────────────────────────────────────────────
// Left corner: radius 32 TL, 4 BL, 4 TR — Right corner: radius 32 TR, 4 BR, 4 TL
// ── Top Bar ───────────────────────────────────────────────────────────────────
function TopBar() {
  const CORNER_W = 64;
  const CORNER_H = 64;
  const GAP_W = 8;
  const FLAT = "#D9D4CF";
  const DARK = "#C3BEBA"; // ~10% darker than FLAT
  const insetShadow = "inset 0 2px 2px rgba(0,0,0,0.25)";
  const insetShadowV = "inset 0 0 2px rgba(0,0,0,0.25)";

  return (
    <div style={{display:"flex", flexDirection:"column"}}>
      {/* Main bar row */}
      <div style={{display:"flex", flexDirection:"row", alignItems:"stretch", height:CORNER_H}}>

        {/* Left corner — flat fill + inset white TL highlight */}
        <div style={{
          width: CORNER_W, height: CORNER_H, flexShrink: 0,
          background: FLAT,
          borderRadius: "32px 4px 4px 4px",
          boxShadow: "inset 16px 8px 8px rgba(255,242,199,0.25)",
        }}/>

        {/* Left gap divider — transparent 8px at top, shadowed bar below */}
        <div style={{width: GAP_W, flexShrink: 0, display:"flex", flexDirection:"column"}}>
          <div style={{height: 8}}/>
          <div style={{flex: 1, background: DARK, boxShadow: insetShadowV}}/>
        </div>

        {/* Middle — flat fill, pill centered */}
        <div style={{
          flex: 1, background: FLAT,
          display: "flex", alignItems: "center", justifyContent: "flex-start",
          paddingLeft: 16,
          boxShadow: "inset 0px 8px 4px rgba(255,242,199,0.25)",
          borderRadius: "4px 4px 0 0",
        }}>
          <div style={{
            width: 98, height: 32, borderRadius: 100,
            background: "#BEBBB6",
            boxShadow: "4px 4px 16px rgba(0,0,0,0.1), inset 8px 8px 16px rgba(0,0,0,0.1)",
          }}/>
        </div>

        {/* Right gap divider — transparent 8px at top, shadowed bar below */}
        <div style={{width: GAP_W, flexShrink: 0, display:"flex", flexDirection:"column"}}>
          <div style={{height: 8}}/>
          <div style={{flex: 1, background: DARK, boxShadow: insetShadowV}}/>
        </div>

        {/* Right corner — flat fill + inset dark BR shadow */}
        <div style={{
          width: CORNER_W, height: CORNER_H, flexShrink: 0,
          background: FLAT,
          borderRadius: "4px 32px 4px 4px",
          boxShadow: "inset -8px 0px 8px rgba(184,181,192,1)",
        }}/>

      </div>

      {/* Bottom spacer — transparent 8px L+R, shadowed bar in between */}
      <div style={{display:"flex", flexDirection:"row"}}>
        <div style={{width: 8}}/>
        <div style={{flex: 1, height: 8, background: DARK, boxShadow: insetShadow}}/>
        <div style={{width: 8}}/>
      </div>
    </div>
  );
}

// ── Speaker Grill ─────────────────────────────────────────────────────────────
// Design spec:
//   Pill: 200px tall × 16px wide, border-radius 100px (full pill)
//   Clipped fill inside pill: 100px tall × 8px wide, anchored top-left
//   Pill shadows: drop-shadow(4 4 8 #fff) + inner-shadow(-8 4 4 #00000080)
//   6 pills with 32px gap; pill 6 has NO clipped fill
//   Group rotated 51deg
function SpeakerGrill() {
  const PILL_H = 200;
  const PILL_W = 16;
  const FILL_H = 100;
  const FILL_W = 8;
  const GAP = 32;
  const COUNT = 6;

  // Total width of the un-rotated group
  const groupW = COUNT * PILL_W + (COUNT - 1) * GAP;
  const groupH = PILL_H;

  // How much extra bounding-box we need after -39° rotation
  // rotated W = w·cos θ + h·sin θ  ;  rotated H = w·sin θ + h·cos θ
  const θ = (39 * Math.PI) / 180;
  const rotW = Math.ceil(groupW * Math.cos(θ) + groupH * Math.sin(θ));
  const rotH = Math.ceil(groupW * Math.sin(θ) + groupH * Math.cos(θ));

  return (
    // Outer wrapper sized to the rotated bounding box so it doesn't clip
    <div style={{ width: rotW, height: rotH, position: "relative", flexShrink: 0 }}>
      {/* Inner group — natural size, rotated around its own centre */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: groupW,
          height: groupH,
          transform: `translate(-50%, -50%) rotate(-39deg)`,
          display: "flex",
          flexDirection: "row",
          gap: GAP,
        }}
      >
        {Array.from({ length: COUNT }).map((_, i) => {
          const hasClip = i < COUNT - 1; // pill 6 (index 5) has no fill
          return (
            <div
              key={i}
              style={{
                width: PILL_W,
                height: PILL_H,
                borderRadius: PILL_W / 2,
                flexShrink: 0,
                // Pill body
                background: "#7B7B7B",
                // Drop shadow: white highlight; inset shadow: dark left rim
                boxShadow:
                  "4px 4px 8px rgba(255,255,255,1), inset -8px 4px 4px rgba(0,0,0,0.5)",
                position: "relative",
                overflow: "hidden", // clip the fill rect to the pill shape
              }}
            >
              {hasClip && (
                // Top-left aligned fill: 100px tall, 8px wide
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: FILL_W,
                    height: FILL_H,
                    background: "#181410",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stripes ───────────────────────────────────────────────────────────────────
function Stripes({ width = 140 }: { width?: number }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12,flexShrink:0,width}}>
      <div style={{height:12,background:"#AD5089",borderRadius:2,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
      <div style={{height:12,background:"#383C83",borderRadius:2,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface GameboyShellProps {
  projects: Project[];
  mode: "home"|"about"|"chat"|"work"|"aichat";
  openProject: (slug: string) => void;
  openChat: () => void;
  closeChat: () => void;
  cycleTheme: () => void;
  setMode: (m: "home"|"about"|"chat"|"work"|"aichat") => void;
  phase: "question"|"processing"|"done"|"rpg";
  twTyped: string[];
  twDone: boolean;
  selected: number|null;
  selectOption: (i: 0|1|2) => void;
  confirmSelection: () => void;
  redPulse: boolean;
  // End state
  endState?: import("@/lib/dialogue").EndState | null;
  tags?: import("@/lib/dialogue").AnswerTag[];
  pathHistory?: {nodeKey:string; choiceIdx:number}[];
  killNode?: string | null;
  character?: import("@/lib/dialogue").CharacterTag;
  treeKey?: number;
  warnBlink?: boolean;
  quip?: string | null;
  showQuip?: boolean;
  locale?: "en" | "ja";
  toggleLocale?: () => void;
  wordmarkPlaceholderRef?: React.Ref<HTMLDivElement>;
  aiChatSlot?: React.ReactNode;
  aboutSlot?: React.ReactNode;
  workSlot?: React.ReactNode;
  openAboutArticle?: (cardId: string) => void;
}

// ── Home-screen cartridges — match standard/brutal home page content & order ──
// Projects | Quiz | About || Blog | Chat | 0→1
const GB_HOME_CARDS: Project[] = [
  { slug:"home-projects", client:"Projects",        category:"WORK",     title:"My Work",                   shortDesc:"", role:"", year:"", thumb:"/images/About/work_thumb.gif",                thumbBg:"#F3F3F7", theme:"light", ctaLabel:"WORK",    sections:[] },
  { slug:"home-quiz",     client:"Interactive Quiz", category:"FIT RPG", title:"Is 0→1 right for you?",     shortDesc:"", role:"", year:"", thumb:"",                                            thumbBg:"#889D58", theme:"light", ctaLabel:"QUIZ",    gbStyle:true, sections:[] },
  { slug:"home-about",    client:"About",            category:"ABOUT",   title:"Process & Work",             shortDesc:"", role:"", year:"", thumb:"/images/amazon/PLO Illustrtration_BLANK.png", thumbBg:"#F5F0E8", theme:"light", ctaLabel:"ABOUT",   sections:[] },
  { slug:"home-blog",     client:"Blog",             category:"BLOG",    title:"On AI Taste And The Future", shortDesc:"", role:"", year:"", thumb:"/images/About/opinion.png",                   thumbBg:"#fff",    theme:"light", ctaLabel:"OPINION", sections:[] },
  { slug:"home-chat",     client:"Chat",             category:"AI CHAT", title:"WWMD",                       shortDesc:"", role:"", year:"", thumb:"/images/About/aboutt2.png",                            thumbBg:"#ADADAD", theme:"light", ctaLabel:"AI CHAT", sections:[] },
  { slug:"home-design",   client:"0→1",              category:"0→1",     title:"Design. Build.",             shortDesc:"", role:"", year:"", thumb:"/images/About/toast.png",                     thumbBg:"#f0eeeb", theme:"light", ctaLabel:"PROCESS", sections:[] },
];

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function GameboyShell({
  projects, mode, openProject, openChat, closeChat,
  cycleTheme, setMode, phase, twTyped, twDone,
  selected, selectOption, confirmSelection,
  endState, tags = [], pathHistory = [], killNode = null, character = "default", treeKey = 0, warnBlink = false, quip = null, showQuip = false, locale = "en", toggleLocale, wordmarkPlaceholderRef, aiChatSlot, aboutSlot, workSlot, openAboutArticle,
}: GameboyShellProps) {
  const isChat = mode === "chat";

  return (
    <div style={{minHeight:"100vh",background: isChat ? "#E8E4DF" : "#fff",padding:"32px 36px 64px",boxSizing:"border-box",fontFamily:'"T-Star Mono",monospace'}}>
      <div style={{maxWidth:1220,margin:"0 auto"}}>
        {/* drop-shadow wrapper traces the combined alpha of TopBar + body */}
        <div style={{filter:"drop-shadow(32px 32px 64px rgba(0,0,0,0.5))"}}>
          <TopBar />
          <div style={{
            background:BODY_BG,
            borderRadius:"0 0 128px 32px",
            boxShadow:"inset 16px 0px 8px rgba(255,242,199,0.25), inset -8px -8px 16px rgba(56,60,131,0.25)",
            display:"flex", flexDirection:"column",
          }}>

          {isChat ? (
            /* ════ CHAT — quiz screen then cards below ════ */
            <>
              <div style={{padding:"24px 32px 24px",display:"flex",flexDirection:"column",gap:24}}>
                {/* Gray screen frame */}
                <div style={{
                  background:"linear-gradient(141deg, rgba(255,255,255,0.2) 0%, transparent 100%), linear-gradient(130deg, #8F8D91 5%, #848487 87%)",
                  borderRadius:"32px 32px 64px 32px",
                  border:"1px solid #8F8D91",
                  boxShadow:"inset 4px 4px 4px rgba(255,242,199,0.5), inset -4px -4px 4px rgba(56,60,131,0.25)",
                  padding:"64px 128px",
                  position:"relative",
                  overflow:"hidden",
                }} className="gb-screen-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icons/gb_screen_BG.png" alt="" aria-hidden="true" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center top",mixBlendMode:"screen",opacity:0.15,pointerEvents:"none",zIndex:10}}/>
                  <div style={{position:"absolute",left:0,top:0,bottom:0,width:128,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <LED blinking={warnBlink}/>
                  </div>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:64,display:"flex",alignItems:"center",gap:12}}>
                    <div className="gb-ribbon-bars" style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
                      <div className="gb-ribbon-bar" style={{height:12,background:"#AD5089",borderRadius:2,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                      <div className="gb-ribbon-bar" style={{height:12,background:"#383C83",borderRadius:2,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                    </div>
                    <span className="gb-ribbon-title" style={{fontFamily:'"T-Star Mono",monospace',fontWeight:300,fontSize:30,color:"rgba(255,255,255,0.6)",textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>MISHA</span>
                    <div className="gb-ribbon-bars" style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
                      <div className="gb-ribbon-bar" style={{height:12,background:"#AD5089",borderRadius:2,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                      <div className="gb-ribbon-bar" style={{height:12,background:"#383C83",borderRadius:2,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                    </div>
                  </div>
                  <Screen overlay={phase==="question" ? <NextButton selected={selected!==null} onConfirm={confirmSelection}/> : undefined}>
                    {phase === "question" && (
                      <div>
                        {twTyped[0] !== undefined && <div style={{marginBottom:8}}>{twTyped[0]}{twTyped.length===1&&!twDone&&<span className="tw-cursor"/>}</div>}
                        {[0,1,2].map(i => {
                          const lineText = twTyped[i+1];
                          if (!lineText) return null;
                          const isSel = selected===i;
                          return (
                            <div key={i} style={{cursor:"pointer",padding:"2px 0",color:isSel?"#1a1a1a":"#3A4324"}}
                              onClick={() => selectOption(i as 0|1|2)}>
                              {isSel?`> ${lineText}`:lineText}
                              {i+1===twTyped.length-1&&!twDone&&<span className="tw-cursor"/>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {phase === "processing" && (
                      <div style={{color:"#3A4324"}}>
                        {showQuip && quip ? <QuipTyper text={quip} cursorColor="#3A4324"/> : <span style={{opacity:0.5}}>···</span>}
                      </div>
                    )}
                    {phase === "done" && endState && (
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{fontSize:30,fontWeight:500,color:"#3A4324",lineHeight:1.3,marginBottom:8}}>{END_COPY[endState].headline(character ?? "default")}</div>
                        <div style={{fontSize:20,fontWeight:300,color:"#3A4324",lineHeight:1.6,marginBottom:4}}>
                          {locale === "ja" ? (JA[`body_${endState.replace(/-/g,"_")}` as keyof typeof JA] ?? summarizePath(tags ?? [], endState)) : summarizePath(tags ?? [], endState)}
                        </div>
                        <TreeReveal key={treeKey} path={pathHistory ?? []} killNodeKey={killNode ?? null} endState={endState} theme="gameboy"/>
                        <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap",justifyContent:"space-between",alignItems:"flex-end"}}>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            {endState !== "win" && <button onClick={openChat} style={{background:"#3A4324",color:"#889D58",border:"none",fontFamily:'"T-Star Mono",monospace',fontSize:16,fontWeight:300,padding:"6px 16px",cursor:"pointer"}}>Again?</button>}
                            {endState === "win"  && <button onClick={openChat} style={{background:"none",border:"1px solid #3A4324",color:"#3A4324",fontFamily:'"T-Star Mono",monospace',fontSize:16,fontWeight:300,padding:"6px 16px",cursor:"pointer"}}>Again?</button>}
                          </div>
                          <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:500,fontSize:16,color:"rgba(58,67,36,0.45)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Next →</span>
                        </div>
                      </div>
                    )}
                  </Screen>
                </div>
                {/* Controls */}
                <div style={{display:"flex",alignItems:"flex-end",gap:16,flexWrap:"wrap"}}>
                  {phase !== "done" && (
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                      <div style={{background:"conic-gradient(from 315deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0) 15%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.36) 42%, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 69%, rgba(50,50,50,0) 80%, rgba(0,0,0,0.15) 100%)",borderRadius:50,padding:1,display:"inline-flex"}}>
                        <div style={{background:"linear-gradient(160deg, #D9D4CF 0%, #C4C0BB 100%)",borderRadius:49,padding:"8px 8px",display:"flex",alignItems:"center",gap:16,position:"relative"}}>
                          {([0,1,2] as const).map(i => (
                            <GameboyButton key={i} sublabel={String.fromCharCode(65+i)} active={selected===i} dimmed={selected!==null&&selected!==i} onClick={() => phase==="question"&&selectOption(i)} hideLabel/>
                          ))}
                          {selected === null && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src="/icons/gb_screen_BG.png" alt="" aria-hidden="true" style={{position:"absolute",inset:0,width:"100%",height:"100%",borderRadius:49,objectFit:"cover",objectPosition:"center top",mixBlendMode:"screen",opacity:0.05,pointerEvents:"none",zIndex:10}}/>
                          )}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:16,paddingLeft:9,paddingRight:9}}>
                        {([0,1,2] as const).map(i => (
                          <span key={i} style={{width:64,textAlign:"center",fontFamily:'"T-Star Mono",monospace',fontWeight:500,fontSize:32,color:selected!==null&&selected!==i?"rgba(56,60,131,0.35)":"#383C83",lineHeight:1,textTransform:"uppercase"}}>{String.fromCharCode(65+i)}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {phase === "done" ? <ControlPill sublabel="Next" onClick={openChat}/> : <ControlPill sublabel="Next" onClick={selected!==null ? confirmSelection : undefined}/>}
                  <ControlPill sublabel="Quit" onClick={closeChat} secondary/>
                </div>
              </div>
              {/* Card grid — pushed down by quiz */}
              <div style={{padding:"0 32px 48px",display:"flex",flexDirection:"column",gap:24}}>
                <div className="gb-card-grid">
                  {GB_HOME_CARDS.map(card => {
                    const onClick =
                      card.slug === "home-projects" ? () => setMode("work") :
                      card.slug === "home-quiz"     ? () => openChat() :
                      card.slug === "home-about"    ? () => setMode("about") :
                      card.slug === "home-blog"     ? () => openAboutArticle?.("who") :
                      card.slug === "home-chat"     ? () => setMode("aichat") :
                      () => setMode("work");
                    return <GameboyCard key={card.slug} project={card} onClick={onClick}/>;
                  })}
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8}}>
                  <DPad/><SpeakerGrill/>
                </div>
              </div>
            </>
          ) : (
            /* ════ HOME ════ */
            <>
              {/* Header — Wordmark + Stripes */}
              <div className="gb-home-header" style={{display:"flex",alignItems:"center",gap:16,padding:"32px 0 0"}}>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{height:12,background:"#AD5089",borderRadius:0,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                  <div style={{height:12,background:"#383C83",borderRadius:0,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                </div>
                <div style={{padding:"0 16px",cursor:"pointer"}} onClick={() => setMode("home")}>
                  <WordmarkPlaceholder innerRef={wordmarkPlaceholderRef}/>
                </div>
                <div className="gb-ribbon-bars" style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
                  <div style={{height:12,background:"#AD5089",borderRadius:0,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                  <div className="gb-ribbon-bar" style={{height:12,background:"#383C83",borderRadius:0,mixBlendMode:"multiply" as React.CSSProperties["mixBlendMode"]}}/>
                </div>
              </div>
              {/* Content */}
              <div style={{padding:"32px 32px 48px",display:"flex",flexDirection:"column",gap:24}}>
                {/* Nav row */}
                <div style={{display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
                  {/* Housing container for circle buttons — same conic-gradient style as ControlPill */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
                    <div style={{
                      background:"conic-gradient(from 315deg, rgba(0,0,0,0.15) 0%, rgba(255,255,255,0) 15%, rgba(255,255,255,0) 30%, rgba(255,255,255,0.36) 42%, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 69%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.15) 100%)",
                      borderRadius:100, padding:1, display:"inline-flex",
                    }}>
                      <div style={{
                        background:"linear-gradient(160deg, #D9D4CF 0%, #C4C0BB 100%)",
                        borderRadius:99, padding:"8px 8px",
                        display:"flex", alignItems:"center", gap:16, position:"relative",
                      }}>
                        <GameboyButton sublabel="Quiz" icon={<Icon name="quiz" size={24}/>} onClick={openChat} hideLabel/>
                        <GameboyButton sublabel="About" icon={<Icon name="about" size={22}/>} active={mode==="about"} onClick={() => setMode(mode==="about"?"home":"about")} hideLabel/>
                        <GameboyButton sublabel="AI Chat" icon={<Icon name="chat" size={22}/>} active={mode==="aichat"} onClick={() => setMode(mode==="aichat"?"home":"aichat")} hideLabel/>
                      </div>
                    </div>
                    {/* Icons row below housing */}
                    <div style={{display:"flex",gap:16,paddingLeft:9,paddingRight:9,marginTop:8}}>
                      {[
                        {icon:<Icon name="quiz" size={24}/>, label:"Quiz"},
                        {icon:<Icon name="about" size={22}/>, label:"About"},
                        {icon:<Icon name="chat" size={22}/>, label:"AI Chat"},
                      ].map(({icon,label})=>(
                        <div key={label} style={{width:64,display:"flex",justifyContent:"center",color:"#383C83"}}>{icon}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{marginTop:16}}><ControlPill sublabel="Theme" onClick={cycleTheme}/></div>
                  {/* Title + body lockup */}
                  <div style={{flex:1, display:"flex", flexDirection:"column", paddingLeft:8, minWidth:160}}>
                    <div style={{height:64, display:"flex", alignItems:"center", paddingTop:8}}>
                      <p style={{fontFamily:'"T-Star Mono",monospace',fontWeight:300,fontSize:14,color:"#D9D4CF",lineHeight:1.4,margin:0,textShadow:"0.75px 0.75px 1.5px #fff, 0.75px 0.75px 1px rgba(0,0,0,0.26), -0.5px -0.5px 0.75px #000"}}>
                        Can Ai &amp; I replace a team? Learn{" "}
                        <button style={{color:"#D9D4CF",textDecoration:"underline",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:"inherit",fontWeight:"inherit",padding:0,textShadow:"inherit"}} onClick={() => {}}>how I built this site</button>
                        , and why Ai can have taste.
                      </p>
                    </div>
                    <div style={{height:20}}/>
                    <div style={{fontFamily:'"T-Star Mono",monospace',fontWeight:500,fontSize:32,color:"#C7C0B9",lineHeight:1,textTransform:"uppercase" as const,filter:"blur(0.5px)",textShadow:"0.75px 0.75px 1.5px #fff, 0.75px 0.75px 1px rgba(0,0,0,0.26), -0.5px -0.5px 0.75px #000"}}>
                      0→1 PRODUCT / Ai &amp; I
                    </div>
                  </div>
                </div>
                {/* AI Chat slot — renders between nav and cards */}
                {aiChatSlot && (
                  <div style={{background:"#f3f3f7", borderRadius:16, overflow:"hidden"}}>
                    {aiChatSlot}
                  </div>
                )}
                {/* About slot */}
                {aboutSlot && (
                  <div style={{background:"#f3f3f7", borderRadius:16, overflow:"hidden"}}>
                    {aboutSlot}
                  </div>
                )}
                {/* Work slot */}
                {workSlot && (
                  <div style={{background:"#f3f3f7", borderRadius:16, overflow:"hidden"}}>
                    {workSlot}
                  </div>
                )}
                {/* Card grid */}
                <div className="gb-card-grid" style={{marginTop:8}}>
                  {GB_HOME_CARDS.map(card => {
                    const onClick =
                      card.slug === "home-projects" ? () => setMode("work") :
                      card.slug === "home-quiz"     ? () => openChat() :
                      card.slug === "home-about"    ? () => setMode("about") :
                      card.slug === "home-blog"     ? () => openAboutArticle?.("who") :
                      card.slug === "home-chat"     ? () => setMode("aichat") :
                      () => setMode("work");
                    return <GameboyCard key={card.slug} project={card} onClick={onClick}/>;
                  })}
                </div>
                {/* D-pad + speaker */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8}}>
                  <DPad/><SpeakerGrill/>
                </div>
              </div>
            </>
          )}

          </div>{/* end body */}
        </div>{/* end drop-shadow wrapper */}
      </div>
    </div>
  );
}
