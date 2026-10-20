"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project } from "@/lib/projects";

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position:"fixed",inset:0,zIndex:2000,
      background:"rgba(0,0,0,0.93)",
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:24,cursor:"zoom-out",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{
        maxWidth:"100%",maxHeight:"90vh",objectFit:"contain",
        borderRadius:8,boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
      }} onClick={e=>e.stopPropagation()}/>
      <button onClick={onClose} aria-label="Close" style={{
        position:"absolute",top:20,right:20,
        width:40,height:40,borderRadius:"50%",
        background:"rgba(255,255,255,0.12)",
        border:"1px solid rgba(255,255,255,0.25)",
        color:"#fff",fontSize:20,cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",
      }}>×</button>
    </div>
  );
}

// ── Vimeo embed ───────────────────────────────────────────────────────────────
function VimeoEmbed({ videoId, startTime = 0, radius = 0 }: {
  videoId: string; startTime?: number; radius?: number;
}) {
  const src = `https://player.vimeo.com/video/${videoId}?autoplay=0&t=${startTime}&byline=0&portrait=0&title=0&dnt=1`;
  return (
    <div style={{
      position:"relative",
      paddingBottom:"56.25%", // 16:9
      height:0,
      overflow:"hidden",
      borderRadius: radius ? `${radius}px` : 0,
    }}>
      <iframe
        src={src}
        style={{
          position:"absolute",top:0,left:0,
          width:"100%",height:"100%",
          border:"none",
          borderRadius: radius ? `${radius}px` : 0,
        }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="Vimeo video"
      />
    </div>
  );
}

// ── Image style ───────────────────────────────────────────────────────────────
function imgStyle(radius?: number, stroke?: boolean, blend?: string, shadow?: boolean): React.CSSProperties {
  return {
    display:"block", width:"100%", height:"auto",
    cursor:"zoom-in", transition:"opacity .15s",
    // border-radius driven by CSS class .pcimg via --br variable (halved on mobile)
    "--br": radius ? `${radius}px` : "0px",
    border: stroke ? "1px solid #000" : "none",
    boxSizing:"border-box",
    boxShadow: shadow ? "4px 4px 16px 0 rgba(0,0,0,0.16)" : undefined,
    ...(blend ? { mixBlendMode: blend as React.CSSProperties["mixBlendMode"] } : {}),
  } as React.CSSProperties;
}

// ── Column wrapper ────────────────────────────────────────────────────────────
function Col({ children, top = false, center = false }: {
  children: React.ReactNode; top?: boolean; center?: boolean;
}) {
  return (
    <div style={{
      width:"100%", maxWidth:820,
      margin: top ? "0 auto" : "32px auto 0",
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </div>
  );
}

// ── Sections renderer — used by both default and split-gradient cards ─────────
export function SectionsList({
  sections,
  onOpen,
  filter,
}: {
  sections: Project["sections"];
  onOpen: (src: string, alt: string) => void;
  filter?: (s: typeof sections[0]) => boolean;
}) {
  const font = '"T-Star Mono",monospace';
  const dim  = "rgba(0,0,0,0.5)";

  const visible = filter ? sections.filter(filter) : sections;

  return (
    <>
      <style>{`
        .grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
        .pc-pair{display:grid;grid-template-columns:1fr 1fr;gap:32px}
        .pc-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:32px}
        .pc-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
        .pcimg{border-radius:var(--br,0px)}
        .pc-br-wrap{border-radius:var(--br,0px);overflow:hidden}
        img.pcimg:hover{opacity:.88}
        @media(max-width:599px){
          .grid3{grid-template-columns:repeat(2,1fr)}
          .pc-pair{grid-template-columns:1fr}
          .pc-grid4{grid-template-columns:repeat(2,1fr)}
          .pcimg{border-radius:calc(var(--br,0px) / 2)}
          .pc-br-wrap{border-radius:calc(var(--br,0px) / 2)}
        }
      `}</style>
      {visible.map((sec, si) => {
        const center = !!sec.centerText;
        const blocks: React.ReactNode[] = [];
        let i = 0;

        while (i < sec.images.length) {
          const img  = sec.images[i];
          const next = sec.images[i + 1];

          // Vimeo embed
          if (img.vimeoId) {
            blocks.push(
              <Col key={`vimeo-${i}`}>
                <VimeoEmbed videoId={img.vimeoId} startTime={img.vimeoStart} radius={img.radius}/>
              </Col>
            );
            i++;

          } else if (img.layout === "grid3-start") {
            const grid = sec.images.slice(i, i + 6);
            blocks.push(
              <Col key={`g3-${i}`}>
                <div className="grid3">
                  {grid.map((gimg, gi) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={gi} src={gimg.src} alt={gimg.alt}
                      className="pcimg"
                      style={imgStyle(gimg.radius, gimg.stroke, gimg.blend, gimg.shadow)}
                      onClick={() => onOpen(gimg.src, gimg.alt)}/>
                  ))}
                </div>
              </Col>
            );
            i += grid.length;

          } else if (img.layout === "grid2-start") {
            const grid = sec.images.slice(i, i + 2);
            blocks.push(
              <Col key={`g2-${i}`}>
                <div className="pc-grid2">
                  {grid.map((gimg, gi) => (
                    gimg.blend ? (
                      <div key={gi} className="pc-br-wrap"
                        style={{"--br": gimg.radius ? `${gimg.radius}px` : "0px", background:"#fff", padding:24, display:"flex", alignItems:"center", justifyContent:"center"} as React.CSSProperties}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={gimg.src} alt={gimg.alt} className="pcimg"
                          style={{...imgStyle(0, gimg.stroke, gimg.blend, gimg.shadow), width:"100%", height:"auto"}}
                          onClick={() => onOpen(gimg.src, gimg.alt)}/>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={gi} src={gimg.src} alt={gimg.alt}
                        className="pcimg"
                        style={imgStyle(gimg.radius, gimg.stroke, gimg.blend, gimg.shadow)}
                        onClick={() => onOpen(gimg.src, gimg.alt)}/>
                    )
                  ))}
                </div>
              </Col>
            );
            i += grid.length;

          } else if (img.layout === "grid4-start") {
            const grid = sec.images.slice(i, i + 4);
            blocks.push(
              <Col key={`g4-${i}`}>
                <div className="pc-grid4">
                  {grid.map((gimg, gi) => (
                    gimg.blend ? (
                      <div key={gi} className="pc-br-wrap"
                        style={{"--br": gimg.radius ? `${gimg.radius}px` : "0px", background:"#fff", padding:24, display:"flex", alignItems:"center", justifyContent:"center"} as React.CSSProperties}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={gimg.src} alt={gimg.alt} className="pcimg"
                          style={{...imgStyle(0, gimg.stroke, gimg.blend, gimg.shadow), width:"100%", height:"auto"}}
                          onClick={() => onOpen(gimg.src, gimg.alt)}/>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={gi} src={gimg.src} alt={gimg.alt}
                        className="pcimg"
                        style={imgStyle(gimg.radius, gimg.stroke, gimg.blend, gimg.shadow)}
                        onClick={() => onOpen(gimg.src, gimg.alt)}/>
                    )
                  ))}
                </div>
              </Col>
            );
            i += grid.length;

          } else if (img.layout === "pair-left" && next) {
            blocks.push(
              <Col key={`pair-${i}`}>
                <div className="pc-pair">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} className="pcimg"
                    style={imgStyle(img.radius, img.stroke, img.blend, img.shadow)}
                    onClick={() => onOpen(img.src, img.alt)}/>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={next.src} alt={next.alt} className="pcimg"
                    style={imgStyle(next.radius, next.stroke, next.blend, next.shadow)}
                    onClick={() => onOpen(next.src, next.alt)}/>
                </div>
              </Col>
            );
            i += 2;

          } else if (img.layout === "editorial") {
            blocks.push(
              <Col key={`ed-${i}`}>
                {img.blend ? (
                  // White container so multiply blend is visible against the bg
                  <div className="pc-br-wrap"
                    style={{"--br": img.radius ? `${img.radius}px` : "0px", background:"#fff"} as React.CSSProperties}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.src} alt={img.alt} className="pcimg"
                      style={imgStyle(img.radius, img.stroke, img.blend, img.shadow)}
                      onClick={() => onOpen(img.src, img.alt)}/>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.src} alt={img.alt} className="pcimg"
                    style={imgStyle(img.radius, img.stroke, img.blend, img.shadow)}
                    onClick={() => onOpen(img.src, img.alt)}/>
                )}
              </Col>
            );
            i++;

          } else {
            // content-width — stays within card padding, full width of content area
            blocks.push(
              <div key={`hero-${i}`} style={{marginTop:32}}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.alt} className="pcimg"
                  style={{...imgStyle(img.radius ?? 16, img.stroke, img.blend, img.shadow), width:"100%"}}
                  onClick={() => onOpen(img.src, img.alt)}/>
              </div>
            );
            i++;
          }
        }

        const hasText = (sec.label && sec.title) || sec.body;

        return (
          <div key={si}>
            {hasText && (
              <Col top={si === 0} center={center}>
                {sec.label && sec.title && (
                  <>
                    <span style={{
                      fontSize:16,letterSpacing:".14em",textTransform:"uppercase",
                      fontWeight:700,color:dim,fontFamily:font,
                      paddingBottom:6,borderBottom:"1px solid rgba(0,0,0,0.15)",
                      display:"inline-block",marginBottom:8,
                    }}>{sec.label}</span>
                    <h2 style={{
                      fontSize:30,fontWeight:700,lineHeight:1.2,
                      letterSpacing:"-.01em",fontFamily:font,
                      color:"#111",marginBottom:12,
                    }}>{sec.title}</h2>
                  </>
                )}
                {sec.body && (
                  <p style={{
                    fontSize:16,lineHeight:1.8,color:"rgba(0,0,0,0.6)",
                    fontWeight:400,fontFamily:font,whiteSpace:"pre-line",
                  }}>{sec.body}</p>
                )}
              </Col>
            )}
            {blocks}
          </div>
        );
      })}
    </>
  );
}

// ── Default export — used by non-split projects ───────────────────────────────
export default function ProjectContent({ project }: { project: Project }) {
  const [lightbox, setLightbox] = useState<{src:string;alt:string}|null>(null);
  const open  = useCallback((src:string,alt:string) => setLightbox({src,alt}), []);
  const close = useCallback(() => setLightbox(null), []);

  const sections = project.sections ?? [];

  if (sections.length === 0) {
    return (
      <Col top>
        <div style={{
          padding:"64px 0",textAlign:"center",
          color:"rgba(0,0,0,0.3)",fontSize:".75rem",
          letterSpacing:".1em",textTransform:"uppercase",
          fontFamily:'"T-Star Mono",monospace',
        }}>
          Content coming soon
        </div>
      </Col>
    );
  }

  return (
    <>
      <SectionsList sections={sections} onOpen={open} />
      {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={close}/>}
    </>
  );
}
