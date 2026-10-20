"use client";
import React, { useState } from "react";
import Image from "next/image";
import { projects } from "@/lib/projects";
import BrutalShadow from "@/components/BrutalShadow";
import Icon from "@/components/Icon";

function ArrowRight({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

export type Theme = "default" | "brutalist" | "pixel" | "rounded" | "gameboy";

export interface WorkSectionProps {
  onClose: () => void;
  openChat: () => void;
  openProject: (slug: string) => void;
  theme: Theme;
  onSelectTheme: (t: Theme) => void;
}

// Projects excluding the RPG card
const workProjects = projects.filter(p => p.slug !== "rpg");

// Per-project card styling for the editorial list
const CFG: Record<string, { bg: string; tc: string }> = {
  "icon-agent": { bg: "#111",                                                  tc: "#fff" },
  shrapnel: { bg: "#111",                                                  tc: "#fff" },
  funko:    { bg: "#F3F3F7",                                               tc: "#111" },
  amazon:   { bg: "linear-gradient(135deg,#FF3578 0%,#B131FF 100%)",       tc: "#fff" },
  sony:     { bg: "#ABCEE8",                                               tc: "#fff" },
};

// Thumbnail used in the editorial row
const THUMB: Record<string, string> = {
  "icon-agent": "/images/amazon/Contact_negative.png",
  shrapnel: "/images/shrapnel/Celestial-Laptop-Mockup.png",
  funko:    "/images/funko/Sailor_mood_desktop_hero.png",
  amazon:   "/images/amazon/NBS_home.png",
  sony:     "/images/sony/vmwarethumb1.png",
};

const THEME_LABELS: Partial<Record<Theme, string>> = {
  default:   "STANDARD",
  brutalist: "BRUTALIST",
  gameboy:   "GAMEBOY",
};
const THEME_ORDER: Theme[] = ["default", "brutalist", "gameboy"];

const font  = '"T-Star Mono",monospace';
const shad  = "4px 4px 16px rgba(0,0,0,0.16)";
const R     = "24px";

// ─── Shared micro-components ─────────────────────────────────────────────────

function Eyebrow({ label, tc = "#111" }: { label: string; tc?: string }) {
  return (
    <span style={{
      fontSize: 16, letterSpacing: ".14em", textTransform: "uppercase" as const,
      fontFamily: font, fontWeight: 500,
      paddingBottom: 6,
      borderBottom: `1px solid ${tc === "#fff" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.25)"}`,
      display: "inline-block", alignSelf: "flex-start", color: tc,
    }}>
      {label}
    </span>
  );
}

function Headline({ children, tc = "#111", style = {} }: {
  children: React.ReactNode; tc?: string; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      fontSize: 30, fontWeight: 500, lineHeight: 1.2, letterSpacing: "-.01em",
      fontFamily: font, marginTop: 4, color: tc, ...style,
    }}>
      {children}
    </div>
  );
}

function Body({ children, tc = "#111", style = {} }: {
  children: React.ReactNode; tc?: string; style?: React.CSSProperties;
}) {
  return (
    <p style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.5, fontFamily: font, color: tc, marginTop: 4, marginBottom: 16, ...style }}>
      {children}
    </p>
  );
}

function YellowBtn({ onClick, children, disabled }: {
  onClick?: () => void; children: React.ReactNode; disabled?: boolean;
}) {
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      marginTop: 16,
      background: disabled ? "rgba(255,255,255,0.15)" : "#FFD000",
      border: `1px solid ${disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.9)"}`,
      borderRadius: 999, padding: "0 24px", height: 40,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: font, fontSize: 14, fontWeight: 500,
      color: disabled ? "#fff" : "#111",
      display: "inline-flex", alignItems: "center", gap: 8,
      boxShadow: disabled ? "none" : shad,
    }}>
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT THEME
// ─────────────────────────────────────────────────────────────────────────────
export default function WorkSection({ onClose, openChat, openProject, theme, onSelectTheme }: WorkSectionProps) {
  const [chatVal, setChatVal] = useState("");
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const goChat = () => { onClose(); openChat(); };

  return (
    <div style={{ fontFamily: font, position: "relative" }}>

      {/* ── Close ── */}
      <button onClick={onClose} aria-label="Close work" className="proj-close-btn">
        <Icon name="check" size={20} />
      </button>

      <div style={{ padding: "32px 32px 0" }}>

        {/* ── WORK header (uncontained, same as About) ── */}
        <div style={{ marginBottom: 32 }}>
          <Eyebrow label="PROJECTS" />
          <Headline>My work. Commerce, frontier Ai, Gaming and more.</Headline>
          <Body>Learn more about the site&apos;s author below!</Body>
        </div>

        {/* ── Editorial project list ── */}
        {workProjects.map(p => {
          const cfg    = CFG[p.slug] ?? { bg: "#f3f3f7", tc: "#111" };
          const thumb  = THUMB[p.slug];
          const isAmazon = p.slug === "amazon";

          const isIconAgent = p.slug === "icon-agent";
          const isShrapnel  = p.slug === "shrapnel";
          const isFunko     = p.slug === "funko";
          const isSony      = p.slug === "sony";
          const isFullBleed = isShrapnel || isFunko || isSony || isAmazon || isIconAgent;

          return (
            <div key={p.slug} style={{
              background: cfg.bg, borderRadius: R, padding: 32, marginBottom: 32,
              display: "flex", gap: 24, alignItems: "center", boxShadow: shad,
              position: "relative", overflow: "hidden",
            }}>
              {/* Shrapnel: full-bleed Inventory_Lockup + dark L→R gradient */}
              {isShrapnel && (
                <>
                  <Image
                    src="/images/shrapnel/Inventory_Lockup.png"
                    alt=""
                    fill
                    unoptimized
                    sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                    style={{ objectFit: "cover", objectPosition: "calc(50% + 200px) calc(50% - 200px)" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(to right, #000205 0%, rgba(0,2,5,0) 100%)",
                  }} />
                </>
              )}
              {/* Sony/VMware: full-bleed boatclose + blue L→R gradient */}
              {isSony && (
                <>
                  <Image
                    src="/images/sony/boatclose.png"
                    alt=""
                    fill
                    sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(to right, #4C6E8F 0%, rgba(99,142,184,0) 100%)",
                  }} />
                </>
              )}
              {/* Amazon Nova: full-bleed nbs1, crop top, purple→pink gradient */}
              {isAmazon && (
                <>
                  <Image
                    src="/images/amazon/NBS_home.png"
                    alt=""
                    fill
                    sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                    style={{ objectFit: "cover", objectPosition: "center top", opacity: 1 }}
                  />
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 1,
                    background: "linear-gradient(to right, rgba(177,49,255,0.9) 0%, rgba(255,53,120,0.4) 100%)",
                  }} />
                </>
              )}
              {isFunko && (
                <>
                  <div style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    width: "50%",
                    height: "180%",
                    zIndex: 1,
                    transform: "translateX(100px) translateY(150px) scale(0.8)",
                    transformOrigin: "center center",
                  }}>
                    <Image
                      src="/images/funko/FunkoThumb.png"
                      alt=""
                      fill
                      sizes="(max-width:960px) 50vw, 25vw"
                      style={{ objectFit: "contain", objectPosition: "center bottom" }}
                    />
                  </div>
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 2,
                    background: "linear-gradient(to right, #F3F3F7 35%, rgba(243,243,247,0) 70%)",
                  }} />
                </>
              )}
              {isIconAgent && (
                <>
                  <div style={{ position:"absolute", inset:0, zIndex:1 }}>
                    <Image
                      src="/images/amazon/Contact_negative.png"
                      alt=""
                      fill
                      sizes="(max-width:960px) 50vw, 33vw"
                      style={{ objectFit:"cover", objectPosition:"right center" }}
                    />
                  </div>
                  <div style={{
                    position: "absolute", inset: 0, zIndex: 2,
                    background: "linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)",
                  }} />
                </>
              )}
              <div style={{ flex: 1, position: "relative", zIndex: 2, maxWidth: 750 }}>
                <Eyebrow label={p.category} tc={cfg.tc} />
                <Headline tc={cfg.tc}>{p.title}</Headline>
                <Body tc={cfg.tc}>
                  {p.shortDesc}
                </Body>
                {isIconAgent || p.slug === "shrapnel"
                  ? <YellowBtn disabled>COMING SOON</YellowBtn>
                  : <YellowBtn onClick={() => openProject(p.slug)}>See More <ArrowRight size={14} /></YellowBtn>
                }
              </div>
              {thumb && !isFullBleed && (
                <div style={{
                  width: 200, height: 152, position: "relative", flexShrink: 0,
                  borderRadius: 16, overflow: "hidden",
                  opacity: 1,
                }}>
                  <Image src={thumb} alt={p.client} fill sizes="200px" style={{
                    objectFit: p.thumbContain ? "contain" : "cover",
                    objectPosition: "center",
                    mixBlendMode: (p.thumbBlend as React.CSSProperties["mixBlendMode"]) ?? undefined,
                  }}/>
                </div>
              )}
            </div>
          );
        })}

        {/* ── BUT WAIT... divider ── */}
        <div style={{ padding: 0 }}>
          <Eyebrow label="BUT WAIT..." />
          <Headline>There&apos;s More!</Headline>
          <Body>Take the Fit Quiz, try a site theme, see the Blog or learn how this site was made!</Body>
        </div>

        {/* ── Quiz CTA (blue, full-width) ── */}
        <div style={{
          background: "#1B6EF3", borderRadius: R, padding: 32, marginTop: 32,
          display: "flex", gap: 24, alignItems: "stretch", boxShadow: shad,
        }}>
          <div style={{ flex: 1, maxWidth: 750 }}>
            <Eyebrow label="RPG QUIZ" tc="#fff" />
            <Headline tc="#fff">Are We A Good Fit? Take The Quiz!</Headline>
            <Body tc="#fff">Learn If Your Organization Is A Good Fit For 0→1 Product Design.</Body>
            <YellowBtn onClick={goChat}>
              Take Quiz <span style={{ fontSize: 18, lineHeight: 1 }}>○</span>
            </YellowBtn>
          </div>
          <div style={{
            width: "33%", position: "relative", flexShrink: 0,
            borderRadius: 16, overflow: "hidden",
          }}>
            <Image src="/images/About/buttons1.gif" alt="Take the quiz" fill sizes="33vw"
              style={{ objectFit: "cover", objectPosition: "-2px center" }}
            />
          </div>
        </div>

        {/* ── Two half-cards ── */}
        <div className="work-two-col" style={{ display: "flex", gap: 32, marginTop: 32 }}>

          {/* Design · Prototype · Build */}
          <div style={{
            flex: 1, background: "#111", borderRadius: R, padding: 32,
            boxShadow: shad, display: "flex", flexDirection: "column",
            position: "relative", overflow: "hidden",
          }}>
            <Image src="/images/About/anim-1.png" alt="" fill
              style={{ objectFit: "cover", objectPosition: "center", opacity: 0.20 }}
            />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
              <Eyebrow label="0→1 / HISTORY" tc="#fff" />
              <Headline tc="#fff">Design. <s style={{ fontWeight: 400 }}>Prototype.</s> Build.</Headline>
              <Body tc="#fff" style={{ flex: 1 }}>Learn how this site was built.</Body>
              <button style={{
                marginTop: 16, background: "#FFD000",
                border: "1px solid rgba(255,255,255,0.9)", borderRadius: 999,
                padding: "0 24px", height: 40, cursor: "pointer",
                fontFamily: font, fontSize: 14, fontWeight: 500, color: "#000",
                display: "inline-flex", alignItems: "center", gap: 8,
                alignSelf: "flex-start",
              }}>
                READ ARTICLE <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Try Site Themes */}
          <div style={{
            flex: 1, background: "#f3f3f7", borderRadius: R, padding: 32,
            boxShadow: shad, display: "flex", flexDirection: "column",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: 32, bottom: 32, width: 175, height: 175 }}>
              <Image src="/images/About/Paint_Brush.png" alt="" fill
                style={{ objectFit: "contain", objectPosition: "right bottom" }}
              />
            </div>
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
            <Eyebrow label="EXPLORE" />
            <Headline>Try Site Themes</Headline>
            <Body style={{ flex: 1 }}>Change the site&apos;s visual style live.</Body>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" as const }}>
              {THEME_ORDER.map(t => {
                const isActive = theme === t;
                return (
                  <div key={t} role="button" tabIndex={0}
                    className="work-theme-btn"
                    onClick={() => onSelectTheme(t)}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelectTheme(t)}
                    onMouseEnter={() => setHoveredTheme(t)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    style={{
                      background: isActive || hoveredTheme === t ? "#1B6EF3" : "#fff",
                      border: `1px solid ${isActive || hoveredTheme === t ? "#fff" : "#111"}`,
                      borderRadius: 999,
                      padding: "0 14px", height: 32, cursor: "pointer",
                      fontFamily: font, fontSize: 12,
                      fontWeight: isActive ? 700 : 400,
                      color: isActive || hoveredTheme === t ? "#fff" : "#111",
                      display: "inline-flex", alignItems: "center", gap: 4,
                      userSelect: "none",
                    }}>
                    {THEME_LABELS[t]}{isActive && " ✓"}
                  </div>
                );
              })}
            </div>
            </div>
          </div>

        </div>

        {/* ── Coming Soon ── */}
        <div style={{ padding: "32px 0 0" }}>
          <Eyebrow label="UNDER CONSTRUCTION" />
          <Headline>More Content Coming 10/31</Headline>
          <Body>This site is regularly updated. Meanwhile, check out more stuff!</Body>
        </div>

        {/* ── AI Chat input ── */}
        <div style={{ padding: "32px 0 48px" }}>
          <div className="chat-input-row" style={{ margin: 0 }}>
            <input
              className="chat-input"
              placeholder="Ask Ai Misha"
              aria-label="Chat with Misha"
              value={chatVal}
              onChange={e => setChatVal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && goChat()}
            />
            <button className="chat-input-send" aria-label="Chat" onClick={goChat}>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRUTALIST THEME — project card list (reused on brutal home page)
// ─────────────────────────────────────────────────────────────────────────────
export function BrutalProjectCards({ openProject }: { openProject: (slug: string) => void }) {
  return (
    <>
      {workProjects.map((p, i) => {
        const isComingSoon = p.slug === "icon-agent" || p.slug === "shrapnel";
        return (
          <React.Fragment key={p.slug}>
            {i > 0 && <div className="bc-spacer" />}
            <div style={{ borderBottom: "1px solid #000", background: "#fff" }}>
              <div className="bc-row">
                <div className="bc-strip-l" />
                <div className="bc-col">
                  <div className="bc-spacer" />
                  <div className="bc-eyebrow">{p.category}</div>
                  <div className="bc-title">{p.title}</div>
                  <div style={{ borderBottom: "1px solid #000", fontSize: 13, fontWeight: 300, lineHeight: 1.5, padding: "8px 0" }}>
                    {p.shortDesc}
                  </div>
                  <div className="bc-spacer" />
                  <div className="bc-cta-wrap">
                    {isComingSoon ? (
                      <div style={{ opacity: 0.5, cursor: "not-allowed" }}>
                        <BrutalShadow block>
                          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,fontFamily:font,fontSize:16,fontWeight:700,color:"#000",width:"100%" }}>COMING SOON</div>
                        </BrutalShadow>
                      </div>
                    ) : (
                      <div style={{ display: "flex" }}>
                        <div style={{ flex: 1 }}>
                          <BrutalShadow block>
                            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,fontFamily:font,fontSize:16,fontWeight:700,color:"#000",cursor:"pointer",width:"100%" }} onClick={() => openProject(p.slug)}>
                              SEE MORE <ArrowRight size={16} />
                            </div>
                          </BrutalShadow>
                        </div>
                        <div style={{ width: 40, marginLeft: -1 }}>
                          <BrutalShadow block>
                            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:40,width:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,cursor:"pointer" }}>
                              <Icon name="share" />
                            </div>
                          </BrutalShadow>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bc-spacer-last" />
                </div>
                <div className="bc-strip-r" />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BRUTALIST THEME — full work section
// ─────────────────────────────────────────────────────────────────────────────
export function BrutalWorkSection({ onClose, openChat, openProject, theme, onSelectTheme }: WorkSectionProps) {
  const [chatVal, setChatVal] = useState("");
  const goChat = () => { onClose(); openChat(); };

  return (
    <div style={{ fontFamily: font, background: "#f3f3f7" }}>
      <div className="bc-row">
        <div className="bc-strip-l" />
        <div className="bc-col">

          <div className="bc-spacer" />

          {/* Done button */}
          <div style={{ height: 56, borderBottom: "1px solid #000", display: "flex", justifyContent: "flex-end", alignItems: "flex-end", marginTop: -16 }}>
            <div style={{ marginBottom: 16, marginRight: 16 }}>
              <BrutalShadow>
                <button onClick={onClose} style={{
                  fontFamily: font, fontSize: 16, fontWeight: 700,
                  background: "#FFD000", border: "1px solid #000",
                  padding: "0 24px", height: 40, cursor: "pointer",
                  display: "flex", alignItems: "center",
                }}>
                  Done
                </button>
              </BrutalShadow>
            </div>
          </div>

          <div className="bc-spacer" />

          {/* WORK header */}
          <div style={{ borderBottom: "1px solid #000" }}>
            <div className="bc-eyebrow">PROJECTS</div>
            <div className="bc-title">My work. Commerce, frontier Ai, Gaming and more.</div>
            <div style={{ borderBottom: "1px solid #000", fontSize: 14, fontWeight: 300, lineHeight: 1.5, padding: "8px 0" }}>
              Learn more about the site&apos;s author below!
            </div>
          </div>

          <div className="bc-spacer" />

          {/* Project items */}
          {workProjects.map((p, i) => {
            const isAmazon = p.slug === "amazon";
            return (
              <React.Fragment key={p.slug}>
                {i > 0 && <div className="bc-spacer" />}
                <div style={{ borderBottom: "1px solid #000", background: "#fff" }}>
                  <div className="bc-row">
                    <div className="bc-strip-l" />
                    <div className="bc-col">
                      <div className="bc-spacer" />
                      <div className="bc-eyebrow">{p.category}</div>
                      <div className="bc-title">{p.title}</div>
                      <div style={{ borderBottom: "1px solid #000", fontSize: 13, fontWeight: 300, lineHeight: 1.5, padding: "8px 0" }}>
                        {p.shortDesc}
                      </div>
                      <div className="bc-spacer" />
                      <div className="bc-cta-wrap">
                        {p.slug === "icon-agent" || p.slug === "shrapnel" ? (
                          <div style={{ opacity: 0.5, cursor: "not-allowed" }}>
                            <BrutalShadow block>
                              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,fontFamily:font,fontSize:16,fontWeight:700,color:"#000",width:"100%" }}>COMING SOON</div>
                            </BrutalShadow>
                          </div>
                        ) : (
                          <div style={{ display: "flex" }}>
                            <div style={{ flex: 1 }}>
                              <BrutalShadow block>
                                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,fontFamily:font,fontSize:16,fontWeight:700,color:"#000",cursor:"pointer",width:"100%" }} onClick={() => openProject(p.slug)}>
                                  SEE MORE <ArrowRight size={16} />
                                </div>
                              </BrutalShadow>
                            </div>
                            <div style={{ width: 40, marginLeft: -1 }}>
                              <BrutalShadow block>
                                <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:40,width:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,cursor:"pointer" }}>
                                  <Icon name="share" />
                                </div>
                              </BrutalShadow>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bc-spacer-last" />
                    </div>
                    <div className="bc-strip-r" />
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          <div className="bc-spacer" />

          {/* BUT WAIT... */}
          <div style={{ borderBottom: "1px solid #000", padding: "0 0 16px" }}>
            <div className="bc-eyebrow">BUT WAIT...</div>
            <div className="bc-title">There&apos;s More!</div>
            <div style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.5 }}>
              Take the Fit Quiz, try a site theme, see the Blog or learn how this site was made!
            </div>
          </div>

          <div className="bc-spacer" />

          {/* Quiz CTA */}
          <div style={{ borderBottom: "1px solid #000", background: "#1B6EF3" }}>
            <div className="bc-row">
              <div className="bc-strip-l" />
              <div className="bc-col">
                <div className="bc-spacer" />
                <div className="bc-eyebrow" style={{ color: "#fff" }}>RPG QUIZ</div>
                <div className="bc-title" style={{ color: "#fff" }}>Are We A Good Fit? Take The Quiz!</div>
                <div style={{ borderBottom: "1px solid #000", fontSize: 13, fontWeight: 300, padding: "8px 0", color: "#fff" }}>
                  Learn If Your Organization Is A Good Fit For 0→1 Product Design.
                </div>
                <div className="bc-spacer" />
                <div className="bc-cta-wrap">
                  <BrutalShadow block>
                    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,fontFamily:font,fontSize:16,fontWeight:700,color:"#000",cursor:"pointer",width:"100%" }} onClick={goChat}>
                      TAKE QUIZ <ArrowRight size={16} />
                    </div>
                  </BrutalShadow>
                </div>
                <div className="bc-spacer-last" />
              </div>
              <div className="bc-strip-r" />
            </div>
          </div>

          <div className="bc-spacer" />

          {/* Design/Build + Themes — two-column row */}
          <div style={{ borderBottom: "1px solid #000", display: "flex", alignItems: "stretch" }}>

            {/* Left: Design · Prototype · Build */}
            <div style={{ flex: 1, background: "#111" }}>
              <div className="bc-row">
                <div className="bc-strip-l" style={{ borderRightColor: "#fff" }} />
                <div className="bc-col">
                  <div style={{ height: 32, borderBottom: "1px solid #fff", flexShrink: 0 }} />
                  <div className="bc-eyebrow" style={{ color: "#fff", borderBottom: "1px solid #fff" }}>0→1 / HISTORY</div>
                  <div className="bc-title" style={{ color: "#fff", borderBottom: "1px solid #fff" }}>Design. Prototype. Build.</div>
                  <div style={{ borderBottom: "1px solid #fff", fontSize: 13, fontWeight: 300, padding: "8px 0", color: "#fff" }}>
                    Learn how this site was built.
                  </div>
                  <div style={{ flex: 1 }} />
                  <div className="bc-cta-wrap" style={{ overflow: "visible" }}>
                    <BrutalShadow block shadowColor="#fff">
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:40,background:"#FFCE00",border:"1px solid #fff",boxSizing:"border-box" as const,fontFamily:font,fontSize:16,fontWeight:700,color:"#000",cursor:"pointer",width:"100%" }}>
                        READ ARTICLE <ArrowRight size={16} />
                      </div>
                    </BrutalShadow>
                  </div>
                  <div className="bc-spacer-last" />
                </div>
                <div className="bc-strip-r" style={{ borderLeftColor: "#fff" }} />
              </div>
            </div>

            {/* 32px gap between cards */}
            <div style={{ width: 32, flexShrink: 0, background: "#f3f3f7", borderLeft: "1px solid #fff", borderRight: "1px solid #000" }} />

            {/* Right: Site Themes */}
            <div style={{ flex: 1, background: "#FFCE00" }}>
              <div className="bc-row">
                <div className="bc-strip-l" />
                <div className="bc-col">
                  <div className="bc-spacer" />
                  <div className="bc-eyebrow">EXPLORE</div>
                  <div className="bc-title">Try Site Themes</div>
                  <div style={{ borderBottom: "1px solid #000", fontSize: 13, fontWeight: 300, padding: "8px 0" }}>
                    Change the site&apos;s visual style live.
                  </div>
                  <div style={{ flex: 1 }} />
                  <div style={{ height: 32 }} />
                  <div className="bc-cta-wrap" style={{ overflow: "visible" }}>
                    <div style={{ display: "flex" }}>
                      {THEME_ORDER.map((t, idx) => {
                        const isActive = theme === t;
                        return (
                          <div key={t} style={{ flex: 1, ...(idx > 0 ? { marginLeft: -1 } : {}) }}>
                            <BrutalShadow block pressed={isActive}>
                              <div
                                style={{
                                  display:"flex",alignItems:"center",justifyContent:"space-between",
                                  padding:"0 16px",height:40,
                                  background: isActive ? "#1B6EF3" : "#FFCE00",
                                  border:"1px solid #000",boxSizing:"border-box" as const,
                                  fontFamily:font,fontSize:14,fontWeight: isActive ? 700 : 400,
                                  color: isActive ? "#fff" : "#000",
                                  cursor:"pointer",width:"100%",gap:8,
                                }}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => onSelectTheme(t)}
                              >
                                {THEME_LABELS[t]}
                                {isActive && <Icon name="check" size={14} />}
                              </div>
                            </BrutalShadow>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="bc-spacer-last" />
                </div>
                <div className="bc-strip-r" />
              </div>
            </div>

          </div>

          <div className="bc-spacer" />

          {/* Coming Soon */}
          <div style={{ borderBottom: "1px solid #000", padding: "0 0 16px" }}>
            <div className="bc-eyebrow">UNDER CONSTRUCTION</div>
            <div className="bc-title">More Content Coming 10/31</div>
            <div style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.5 }}>
              This site is regularly updated. Meanwhile, check out more stuff!
            </div>
          </div>

          <div className="bc-spacer" />

          {/* Chat input */}
          <div style={{ borderBottom: "1px solid #000" }}>
            <div className="bc-row">
              <div className="bc-strip-l" />
              <div className="bc-col">
                <div className="bc-spacer" />
                <div className="bc-cta-wrap">
                  <div style={{ display: "flex" }}>
                    <div style={{ flex: 1 }}>
                      <BrutalShadow block>
                        <div style={{ display:"flex",alignItems:"center",height:40,background:"#fff",border:"1px solid #000",boxSizing:"border-box" as const,width:"100%",padding:"0 24px" }}>
                          <input
                            value={chatVal}
                            onChange={e => setChatVal(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && goChat()}
                            placeholder="Ask Ai Misha"
                            style={{ border:"none",outline:"none",width:"100%",fontFamily:font,fontSize:16,background:"transparent" }}
                          />
                        </div>
                      </BrutalShadow>
                    </div>
                    <div style={{ width: 40, marginLeft: -1 }}>
                      <BrutalShadow block>
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:40,width:40,background:"#FFCE00",border:"1px solid #000",boxSizing:"border-box" as const,cursor:"pointer" }} onClick={goChat}>
                          <ArrowRight size={16} />
                        </div>
                      </BrutalShadow>
                    </div>
                  </div>
                </div>
                <div className="bc-spacer-last" />
              </div>
              <div className="bc-strip-r" />
            </div>
          </div>

          <div className="bc-spacer-last" />
        </div>
        <div className="bc-strip-r" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone project card list — reused on the homepage work section
// ─────────────────────────────────────────────────────────────────────────────
export function WorkProjectCards({ openProject }: { openProject: (slug: string) => void }) {
  return (
    <>
      {workProjects.map(p => {
        const cfg       = CFG[p.slug] ?? { bg: "#f3f3f7", tc: "#111" };
        const thumb     = THUMB[p.slug];
        const isAmazon  = p.slug === "amazon";
        const isIconAgent = p.slug === "icon-agent";
        const isShrapnel = p.slug === "shrapnel";
        const isFunko   = p.slug === "funko";
        const isSony    = p.slug === "sony";
        const isFullBleed = isShrapnel || isFunko || isSony || isAmazon || isIconAgent;

        return (
          <div key={p.slug} style={{
            background: cfg.bg, borderRadius: R, padding: 32, marginBottom: 32,
            display: "flex", gap: 24, alignItems: "center", boxShadow: shad,
            position: "relative", overflow: "hidden",
          }}>
            {isShrapnel && (
              <>
                <Image src="/images/shrapnel/Inventory_Lockup.png" alt="" fill
                  unoptimized
                  sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                  style={{ objectFit:"cover", objectPosition:"calc(50% + 200px) calc(50% - 200px)" }}
                />
                <div style={{ position:"absolute", inset:0, zIndex:1,
                  background:"linear-gradient(to right, #000205 0%, rgba(0,2,5,0) 100%)" }} />
              </>
            )}
            {isSony && (
              <>
                <Image src="/images/sony/boatclose.png" alt="" fill
                  sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                  style={{ objectFit:"cover", objectPosition:"center" }}
                />
                <div style={{ position:"absolute", inset:0, zIndex:1,
                  background:"linear-gradient(to right, #4C6E8F 0%, rgba(99,142,184,0) 100%)" }} />
              </>
            )}
            {isAmazon && (
              <>
                <Image src="/images/amazon/NBS_home.png" alt="" fill
                  sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                    style={{ objectFit:"cover", objectPosition:"center top", opacity: 1 }}
                />
                <div style={{ position:"absolute", inset:0, zIndex:1,
                  background:"linear-gradient(to right, rgba(177,49,255,0.9) 0%, rgba(255,53,120,0.4) 100%)" }} />
              </>
            )}
            {isFunko && (
              <>
                <div style={{ position:"absolute", right:0, bottom:0, width:"50%", height:"180%", zIndex:1,
                  transform:"translateX(100px) translateY(150px) scale(0.8)", transformOrigin:"center center" }}>
                  <Image src="/images/funko/FunkoThumb.png" alt="" fill
                    sizes="(max-width:960px) 50vw, 25vw"
                    style={{ objectFit:"contain", objectPosition:"center bottom" }}
                  />
                </div>
                <div style={{ position:"absolute", inset:0, zIndex:2,
                  background:"linear-gradient(to right, #F3F3F7 35%, rgba(243,243,247,0) 70%)" }} />
              </>
            )}
            {isIconAgent && (
              <>
                <div style={{ position:"absolute", inset:0, zIndex:1 }}>
                  <Image src="/images/amazon/Contact_negative.png" alt="" fill
                    sizes="(max-width:960px) 50vw, 33vw"
                    style={{ objectFit:"cover", objectPosition:"right center" }}
                  />
                </div>
                <div style={{ position:"absolute", inset:0, zIndex:2,
                  background:"linear-gradient(to right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 80%)" }} />
              </>
            )}
            <div style={{ flex:1, position:"relative", zIndex:2, maxWidth:750 }}>
              <Eyebrow label={p.category} tc={cfg.tc} />
              <Headline tc={cfg.tc}>{p.title}</Headline>
              <Body tc={cfg.tc}>
                {p.shortDesc}
              </Body>
              {isIconAgent || p.slug === "shrapnel"
                ? <YellowBtn disabled>COMING SOON</YellowBtn>
                : <YellowBtn onClick={() => openProject(p.slug)}>See More <ArrowRight size={14} /></YellowBtn>
              }
            </div>
            {thumb && !isFullBleed && (
              <div style={{ width:200, height:152, position:"relative", flexShrink:0,
                borderRadius:16, overflow:"hidden" }}>
                <Image src={thumb} alt={p.client} fill sizes="200px" style={{
                  objectFit: p.thumbContain ? "contain" : "cover",
                  objectPosition:"center",
                  mixBlendMode:(p.thumbBlend as React.CSSProperties["mixBlendMode"]) ?? undefined,
                }}/>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
