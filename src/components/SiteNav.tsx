"use client";

// Shared nav — identical on home and project pages.
// On home, openChat/setMode wire to SiteShell state.
// On project pages, pass no-op functions and the buttons still render identically.

import Icon from "@/components/Icon";

const shadow  = "4px 4px 16px rgba(0,0,0,0.20)";
const wborder = "1px solid rgba(255,255,255,0.9)";

interface SiteNavProps {
  onChat?:  () => void;
  onAbout?: () => void;
  onTheme?: () => void;
  activeMode?: "home" | "chat" | "about";
}

export default function SiteNav({
  onChat  = () => {},
  onAbout = () => {},
  onTheme = () => {},
  activeMode,
}: SiteNavProps) {
  return (
    <nav style={{
      display:"flex", alignItems:"center",
      justifyContent:"space-between", marginTop:32,
    }} aria-label="Site navigation">
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <button
          onClick={onChat}
          aria-label="Chat"
          className={`snav-btn${activeMode === "chat" ? " snav-active" : ""}`}
        >
          <Icon name="chat" size={24}/>
        </button>
        <button
          onClick={onAbout}
          aria-label="About"
          className={`snav-btn${activeMode === "about" ? " snav-active" : ""}`}
        >
          <Icon name="about" size={24}/>
        </button>
        <button onClick={onTheme} aria-label="Theme" className="snav-btn">
          <Icon name="theme" size={22}/>
        </button>
        <button aria-label="Share" className="snav-btn">
          <Icon name="share" size={22}/>
        </button>
      </div>

      <div style={{ display:"none" }} className="snav-powered-wrap">
        <span className="snav-powered">Powered by Claude / AI interaction</span>
      </div>

      <style>{`
        .snav-btn{
          width:56px;height:56px;border-radius:50%;
          border:${wborder};
          background:#FFD000;color:#111;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;box-shadow:${shadow};
          font-family:"T-Star Mono",monospace;font-size:16px;font-weight:500;
          transition:background .12s,color .12s;
        }
        .snav-btn:hover,.snav-active{background:#1B6EF3;color:#fff}
        .snav-powered{
          font-size:16px;font-weight:300;letter-spacing:.04em;
          color:#1B6EF3;background:#f3f3f7;border-radius:999px;
          padding:0 1.25rem;white-space:nowrap;
          display:inline-flex;align-items:center;height:56px;flex-shrink:0;
          font-family:"T-Star Mono",monospace;
        }
        @media(min-width:500px){
          .snav-powered-wrap{display:flex !important}
        }
      `}</style>
    </nav>
  );
}
