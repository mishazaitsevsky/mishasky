"use client";

import { useState, useEffect, useRef } from "react";
import WordmarkFixed, { WordmarkPlaceholder, WordmarkSVG, THEME_FLIP_DELAY, TOTAL_JUMP_MS, type WordmarkFixedHandle } from "@/components/WordmarkFixed";
import WordKeyboard from "@/components/WordKeyboard";
import MishaSpinner from "@/components/MishaSpinner";
import Link from "next/link";
import WorkSection, { BrutalWorkSection, WorkProjectCards, BrutalProjectCards } from "@/components/WorkSection";
import Image from "next/image";
import { projects, getProject } from "@/lib/projects";
import Icon from "@/components/Icon";
import Pictogram from "@/components/Pictogram";
import ProjectContent, { SectionsList } from "@/components/ProjectContent";
import GameboyShell from "@/components/GameboyShell";
import BrutalShadow from "@/components/BrutalShadow";
import { CURVE, T, keyframes, anim } from "@/lib/motion";
import {
  QUESTIONS,
  END_COPY,
  resolveEndState,
  resolveKillNode,
  retryCopy,
  summarizePath,
  type AnswerTag,
  type EndState,
  type CharacterTag,
} from "@/lib/dialogue";
import JA from "@/lib/ja";
import { generateResponse } from "@/lib/freeform";

type Mode      = "home" | "chat" | "about" | "work" | "aichat";
type Theme     = "default" | "brutalist" | "pixel" | "rounded" | "gameboy";
type ChatPhase = "question" | "processing" | "done" | "rpg";

const themeOrder: Theme[] = ["default", "brutalist", "gameboy"];
const SPINNER_FRAMES = ["⠋","⠙","⠹","⠸","⠼","⠴","⠦","⠧","⠇","⠏"];

// ── Wordmark ──────────────────────────────────────────────────────────────────
function Wordmark() {
  return (
    <span aria-label="MiSH∆" style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
      <svg width="38" height="32" viewBox="0 0 38 32" fill="none" aria-hidden="true">
        <path d="M32.5562 27.5H26.3755L32.5562 16.793V27.5Z" fill="white" stroke="white" strokeWidth="9"/>
        <path d="M4.49951 27.5H10.6802L4.49951 16.793V27.5Z" fill="white" stroke="white" strokeWidth="9"/>
      </svg>
      <svg width="9" height="32" viewBox="0 0 9 32" fill="none" aria-hidden="true">
        <circle cx="4.459" cy="4.459" r="4.459" fill="white"/>
        <rect y="12.59" width="8.918" height="19.41" fill="white"/>
      </svg>
      <svg width="16" height="32" viewBox="0 0 16 32" fill="none" aria-hidden="true">
        <path d="M0 8C0 12.418 3.582 16 8 16V0C3.582 0 0 3.582 0 8Z" fill="white"/>
        <path d="M15.724 24C15.724 19.582 12.142 16 7.724 16L7.724 32C12.142 32 15.724 28.418 15.724 24Z" fill="white"/>
      </svg>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="10.667" height="10.667" fill="white"/>
        <rect x="10.667" y="10.667" width="10.667" height="10.667" fill="white"/>
        <rect y="21.333" width="10.667" height="10.667" fill="white"/>
        <rect x="21.333" width="10.667" height="10.667" fill="white"/>
        <rect x="21.333" y="21.333" width="10.667" height="10.667" fill="white"/>
      </svg>
      <svg width="37" height="32" viewBox="0 0 37 32" fill="none" aria-hidden="true">
        <path d="M18.475 0L36.95 32H0L18.475 0Z" fill="black"/>
        <path d="M36.95 32H0L18.476 0L36.95 32ZM10.393 26H26.558L18.475 12L10.393 26Z" fill="#FFD132"/>
      </svg>
    </span>
  );
}

function ArrowRight({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ transform:"rotate(90deg)", flexShrink:0 }} aria-hidden="true">
      <path d="M21.25 10.543L12.104 1.397C11.909 1.201 11.592 1.201 11.397 1.397L2.25 10.543M11.75 1.25V22.043"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function Spinner() {
  const [f, setF] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setF(n => (n + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(t);
  }, []);
  return (
    <span aria-hidden="true" style={{
      fontFamily:'"T-Star Mono",monospace',
      fontSize:22, fontWeight:300,
      color:"rgba(255,255,255,0.8)",
    }}>
      {SPINNER_FRAMES[f]}
    </span>
  );
}

// Warning blink — same slot as spinner, uses heartbeat keyframe
function WarnBlink() {
  return (
    <span aria-hidden="true" style={{ display:"inline-flex", alignItems:"center" }}>
      <svg width="22" height="20" viewBox="0 0 36 32" fill="none"
        style={{ animation:"heartbeat 800ms cubic-bezier(0.5,0,0.85,1) infinite" }}>
        <path d="M14.1494 2.02051C15.6836 -0.673553 19.5663 -0.673405 21.1006 2.02051L34.7197 25.9365C36.1907 28.5198 34.4297 31.7095 31.5283 31.9062L31.2441 31.916H4.00586L3.72168 31.9062C0.914057 31.7156 -0.826287 28.7225 0.397461 26.1885L0.530273 25.9365L14.1494 2.02051ZM16.2695 23.2324V25.9365H19V23.2324H16.2695ZM17.6738 7.47656C17.3792 7.47656 17.136 7.58019 16.9453 7.78809C16.772 7.97875 16.6855 8.22194 16.6855 8.5166V20.2949C16.6857 20.5894 16.772 20.8409 16.9453 21.0488C17.136 21.2395 17.3792 21.335 17.6738 21.335C17.951 21.3349 18.1854 21.2394 18.376 21.0488C18.5838 20.8409 18.6874 20.5894 18.6875 20.2949V8.5166C18.6875 8.22193 18.584 7.97876 18.376 7.78809C18.1854 7.5802 17.951 7.47663 17.6738 7.47656Z" fill="rgba(255,255,255,0.9)"/>
      </svg>
    </span>
  );
}

// ── QuipTyper — types the processing quip character by character ─────────────
export function QuipTyper({ text, cursorColor }: { text: string; cursorColor?: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    let cancelled = false;
    function tick() {
      if (cancelled) return;
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) setTimeout(tick, 30);
    }
    const t = setTimeout(tick, 50);
    return () => { cancelled = true; clearTimeout(t); };
  }, [text]);

  return (
    <div className="chat-quip">
      {displayed}
      {displayed.length < text.length && (
        <span className="tw-cursor" style={cursorColor ? {borderLeftColor: cursorColor} : undefined}/>
      )}
    </div>
  );
}

// ── Flag icons ────────────────────────────────────────────────────────────────
function FlagJP({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#f0f0f0"/>
      <circle cx="32" cy="32" r="13" fill="#BC002D"/>
    </svg>
  );
}

function FlagUS({ size = 22 }: { size?: number }) {
  // Site blue replaces navy: #1B6EF3
  // Red: #BC002D, White: #f0f0f0
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <clipPath id="flag-us-clip"><circle cx="32" cy="32" r="32"/></clipPath>
      <g clipPath="url(#flag-us-clip)">
        {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <rect key={i} x="0" y={i * (64/13)} width="64" height={64/13}
            fill={i % 2 === 0 ? "#BC002D" : "#f0f0f0"}/>
        ))}
        <rect x="0" y="0" width="26" height={64 * 7/13} fill="#1B6EF3"/>
        {[...Array(15)].map((_, i) => {
          const col = i % 5; const row = Math.floor(i / 5);
          return <circle key={i} cx={2.6 + col * 4.8} cy={2.6 + row * 5.8} r="1.2" fill="white"/>;
        })}
      </g>
      <circle cx="32" cy="32" r="31" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/>
    </svg>
  );
}

function NavButtons({ mode, openChat, setMode, cycleTheme, brutal, chatButtons, onAboutToggle }: {
  mode: Mode; openChat:()=>void; setMode:(m:Mode)=>void; cycleTheme:()=>void;
  brutal?: boolean;
  chatButtons?: { selected: number|null; onSelect:(i:0|1|2)=>void; onConfirm:()=>void; };
  onAboutToggle?: () => void;
}) {
  const [hovered, setHovered] = useState<string|null>(null);

  const btn = (active: boolean, onClick: ()=>void, label: string, icon: React.ReactNode, overrideBg?:string, animateOnMount=false, mountDelay=0) => {
    const isHovered = brutal && hovered === label;
    const face = (
      <button
        className={`nav-btn${active ? " on" : ""}`}
        onClick={onClick}
        aria-label={label}
        onMouseEnter={brutal ? ()=>setHovered(label) : undefined}
        onMouseLeave={brutal ? ()=>setHovered(null) : undefined}
        style={brutal ? {
          borderRadius: 0,
          border: "1px solid #000",
          background: isHovered ? "#1B6EF3" : overrideBg ?? (active ? "#1B6EF3" : "#FFCE00"),
          color: (isHovered || active) ? "#fff" : "#000",
          boxShadow: "none",
        } : undefined}
      >
        {icon}
      </button>
    );
    if (!brutal) return face;
    return (
      <div className="brutal-btn-wrap" style={{ position:"relative", overflow:"visible", display:"inline-flex" }}>
        <BrutalShadow pressed={active} animateOnMount={animateOnMount} mountDelay={mountDelay}>{face}</BrutalShadow>
      </div>
    );
  };

  if (chatButtons) {
    const { selected, onSelect, onConfirm } = chatButtons;
    const hasSelection = selected !== null;
    return (
      // Whole button group spans exactly one card column width (col + gap)
      <div style={{display:"flex", alignItems:"flex-end", gap:24, overflow:"visible", width:"calc((100% - 64px) / 3 + 32px)"}}>
        {([0,1,2] as const).map(i => {
          const isSelected = selected===i;
          const bg = isSelected ? "#1B6EF3" : hasSelection ? "#fff" : "#FFCE00";
          const fg = isSelected ? "#fff" : "#000";
          const face = (
            <button
              className="nav-btn"
              onClick={()=>onSelect(i)}
              aria-label={`Option ${String.fromCharCode(65+i)}`}
              style={{ borderRadius:0, border:"1px solid #000", boxShadow:"none", background:bg, color:fg, fontWeight:300, fontSize:32 }}
            >
              {String.fromCharCode(65+i)}
            </button>
          );
          return (
            <div key={i} style={{position:"relative", overflow:"visible", display:"inline-flex", alignItems:"flex-end", height:72, flexShrink:0}}>
              <BrutalShadow pressed={isSelected}>{face}</BrutalShadow>
            </div>
          );
        })}
        {/* Confirm — arrow when idle, "Sure?" when selection made */}
        {(() => {
          const arrowBg = hasSelection ? "#FFCE00" : "#fff";
          const face = (
            <button
              className="nav-btn"
              onClick={hasSelection ? onConfirm : undefined}
              aria-label="Confirm"
              style={{ borderRadius:0, border:"1px solid #000", boxShadow:"none", background:arrowBg, color:"#000", cursor: hasSelection ? "pointer" : "default", width:"100%", fontFamily:'"T-Star Mono",monospace', fontSize:30, fontWeight:300 }}
            >
              {hasSelection ? <ArrowRight size={22}/> : <ArrowRight size={22}/>}
            </button>
          );
          return (
            <div style={{position:"relative", overflow:"visible", display:"inline-flex", alignItems:"flex-end", height:72, flex:1, minWidth:64}}>
              <BrutalShadow block pressed={!hasSelection}>{face}</BrutalShadow>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <>
      {btn(false, openChat, "Quiz", <Icon name="quiz" size={24}/>, undefined, true, 25)}
      {btn(mode==="about", mode==="about" ? (onAboutToggle ?? (()=>setMode("home"))) : ()=>setMode("about"), "About", <Icon name="about" size={24}/>, undefined, true, 50)}
      {btn(mode==="aichat", ()=>setMode("aichat"), "AI Chat", <Icon name="chat"  size={24}/>, undefined, true, 75)}
      {btn(false, cycleTheme, "Theme", <Icon name="theme" size={22}/>, undefined, true, 100)}
    </>
  );
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
// Types question then A/B/C options sequentially at 30ms/char.
// Returns: typed lines array + whether typing is still in progress.
function useTypewriter(lines: string[], active: boolean, key: number = 0) {
  const [typed, setTyped] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setTyped([]); setDone(false); return; }
    setTyped([]);
    setDone(false);

    let lineIdx   = 0;
    let charIdx   = 0;
    let cancelled = false;

    function tick() {
      if (cancelled) return;
      if (lineIdx >= lines.length) { setDone(true); return; }

      const line    = lines[lineIdx];
      const isOpt   = lineIdx > 0; // options type 3x faster
      const speed   = isOpt ? 10 : 30;
      charIdx++;

      setTyped(prev => {
        const next = [...prev];
        next[lineIdx] = line.slice(0, charIdx);
        return next;
      });

      if (charIdx >= line.length) { lineIdx++; charIdx = 0; }
      setTimeout(tick, speed);
    }

    const start = setTimeout(tick, 300);
    return () => { cancelled = true; clearTimeout(start); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, active]);

  return { typed, done };
}

// ── Tree Reveal ───────────────────────────────────────────────────────────────
export function TreeReveal({
  path,
  killNodeKey,
  endState,
  theme = "default",
  hideStart = false,
}: {
  path: { nodeKey: string; choiceIdx: number }[];
  killNodeKey: string | null;
  endState: EndState;
  theme?: "default" | "gameboy";
  hideStart?: boolean;
}) {
  const SPINE    = ["story","intent","who","where","why","role","env","pay","ai"];
  const visitedMap = new Map(path.map(p => [p.nodeKey, p.choiceIdx]));
  const killIdx  = killNodeKey ? SPINE.indexOf(killNodeKey) : -1;
  const visible  = killIdx >= 0 ? SPINE.slice(0, killIdx + 1) : SPINE;
  const totalCols = visible.length;

  // Animation delays — pure CSS, no state
  // col 0 = start bookend (no animation), cols 1..N = path nodes, col N+1 = finish
  // Revised timing: connector arrives → node reveals (stroke + fill together)
  const STAGGER    = 400;
  const CONN_DUR   = 400;   // connector wipes left→right
  const REVEAL_DUR = 800;   // fill + letters + stroke all flicker in together after connector

  function colBaseDelay(colIdx: number): number {
    return Math.max(0, colIdx - 1) * STAGGER;
  }
  function connDelay(colIdx: number): number {
    return colBaseDelay(colIdx);
  }
  function fillDelay(colIdx: number): number {
    return colBaseDelay(colIdx) + CONN_DUR;
  }

  function fillLayerStyle(colIdx: number): React.CSSProperties {
    if (colIdx === 0) return {};
    return {
      opacity: 0,
      animation: `node-fill-in ${REVEAL_DUR}ms ease-out ${fillDelay(colIdx)}ms 1 forwards`,
    };
  }

  // Box reveal style: starts at 20%, flickers to 100% when connector arrives
  function boxRevealStyle(colIdx: number): React.CSSProperties {
    if (colIdx === 0) return {};
    return {
      opacity: 0.2,
      animation: `node-fill-in ${REVEAL_DUR}ms ease-out ${fillDelay(colIdx)}ms 1 forwards`,
    };
  }

  function boxPath(x: number, y: number): string {
    return `M${x},${y} h${BOX} v${BOX} h-${BOX} Z`;
  }

  const isWin  = endState === "win";
  const GB        = theme === "gameboy";
  const GBdark    = "#3A4324";  // the dark pixel — only color used on GB screen

  // Connector color: GB always uses the dark pixel
  const connectorColor = GB ? GBdark : isWin ? "#000" : "#fff";
  const flagFilter = GB ? undefined : isWin ? "invert(1)" : undefined;

  // Box colors
  // Default: chosen solid, unchosen outline, kill red
  // GB: everything is GBdark — unchosen outline at 20%, chosen solid (no visible letter = solid pixel),
  //     win chosen = knockout (no fill, full stroke), kill = solid (same as chosen)
  function boxStyle(chosen: boolean, kill: boolean) {
    if (GB) {
      if (kill)   return { fill: GBdark,  stroke: GBdark,  fg: "#889D58" }; // solid, letter visible as screen color
      if (chosen) return { fill: GBdark,  stroke: GBdark,  fg: "#889D58" }; // solid, letter as screen color (win + lose same)
      return             { fill: "none",  stroke: GBdark,  fg: GBdark   }; // outline only
    }
    if (kill)   return { fill: "#cc0000", stroke: "#fff", fg: "#fff" };
    if (chosen) return { fill: isWin ? "#000" : "#fff", stroke: isWin ? "#000" : "#fff", fg: isWin ? "#FFD000" : "#1B6EF3" };
    return             { fill: "none",   stroke: isWin ? "#000" : "#fff", fg: isWin ? "#000" : "#fff" };
  }

  const COLS_PER_ROW = 4; // reserved for future row-wrap; currently single-row with scroll
  const rows = [];
  for (let i = 0; i < visible.length; i += COLS_PER_ROW) {
    rows.push(visible.slice(i, i + COLS_PER_ROW));
  }
  const isMultiRow = rows.length > 1;

  // Compact sizing when many columns — fits better on narrow screens
  const BOX     = totalCols > 6 ? 32 : 40;
  const GAP     = 0;
  const COL_GAP = totalCols > 6 ? 20 : 32;
  const PAD_X   = 4;
  const PAD_Y   = 4;
  const ROWS    = 3;

  const colStep = BOX + COL_GAP;
  const spineY  = PAD_Y + BOX + BOX / 2;
  const svgH    = PAD_Y * 2 + ROWS * BOX + 42;

  // Bookend geometry
  const BOOKEND_W   = BOX + COL_GAP;
  const pathOffsetX = hideStart ? PAD_X : PAD_X + BOOKEND_W;
  const finishX     = pathOffsetX + totalCols * colStep;
  const extSvgW     = finishX + BOX + PAD_X + 8;

  // Icons 18×23 (15% up from 16×20), centered in BOX×BOX
  const flagW = 18; const flagH = 23;
  const flagCX = (BOX - flagW) / 2;
  const flagCY = (BOX - flagH) / 2;

  // Bookend connects from center of its single box
  const bookendMidY = PAD_Y + BOX / 2;

  // Inline SVG paths for flags (color controlled directly)
  // StartFlag1 path (viewBox 0 0 18 22) — scaled to flagW×flagH
  const startPath = "M3.5 1.25H17.5V16.75H3.5V19.75H5.5V21.25H0V19.75H2V0H3.5V1.25ZM3.5 15.25H16V2.75H3.5V15.25Z";
  // FinishFlaf1 path
  const finishPath = "M3.5 1.25H17.5V16.75H3.5V19.75H5.5V21.25H0V19.75H2V0H3.5V1.25ZM9.75 9H3.5V15.25H9.75V9H16V2.75H9.75V9Z";

  const startFlagColor  = GB ? GBdark : isWin ? "#000" : "#fff";
  const finishFlagColor = GB ? GBdark : isWin ? "#FFD000" : "#fff";

  return (
    <div style={{ overflowX: "auto", marginTop: 16, marginBottom: 8, marginLeft: 0 }}>
      <svg
        width={extSvgW}
        height={svgH}
        viewBox={`0 0 ${extSvgW} ${svgH}`}
        aria-label="Decision path"
        style={{ display: "block" }}
      >
        {/* ── Ghost connectors at 20%: all incoming connectors, rendered behind columns ── */}
        <g opacity="0.2">
          {visible.map((nk, col) => {
            if (hideStart && col === 0) return null;
            const x = pathOffsetX + col * colStep;
            const chosenIdx = visitedMap.get(nk) ?? 1;
            const pts: [number,number][] = [];
            if (col === 0) {
              const targetY = PAD_Y + chosenIdx * BOX + BOX / 2;
              const midX = PAD_X + BOX + COL_GAP / 2;
              if (bookendMidY === targetY) {
                pts.push([PAD_X + BOX, bookendMidY], [pathOffsetX, bookendMidY]);
              } else {
                pts.push([PAD_X + BOX, bookendMidY], [midX, bookendMidY], [midX, targetY], [pathOffsetX, targetY]);
              }
            } else {
              const prevNk = visible[col - 1];
              const prevChosen = visitedMap.get(prevNk) ?? 1;
              const prevX = pathOffsetX + (col - 1) * colStep;
              const y1 = PAD_Y + prevChosen * BOX + BOX / 2;
              const y2 = PAD_Y + chosenIdx * BOX + BOX / 2;
              const midX = prevX + BOX + COL_GAP / 2;
              if (prevChosen === chosenIdx) {
                pts.push([prevX + BOX, y1], [prevX + BOX + COL_GAP, y1]);
              } else {
                pts.push([prevX + BOX, y1], [midX, y1], [midX, y2], [prevX + BOX + COL_GAP, y2]);
              }
            }
            if (pts.length < 2) return null;
            const d = pts.map((p, i) => `${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
            return <path key={nk} d={d} fill="none" stroke={connectorColor} strokeWidth="1.5"/>;
          })}
          {/* Also ghost the finish connector */}
          {!killNodeKey && (() => {
            const lastCol = visible.length - 1;
            const lastChosen = visitedMap.get(visible[lastCol]) ?? 1;
            const lastX = pathOffsetX + lastCol * colStep;
            const y1 = PAD_Y + lastChosen * BOX + BOX / 2;
            const midX = finishX - COL_GAP / 2;
            if (y1 === bookendMidY) {
              return <path d={`M${lastX + BOX},${y1} L${finishX},${y1}`} fill="none" stroke={connectorColor} strokeWidth="1.5"/>;
            }
            return <path d={`M${lastX + BOX},${y1} L${midX},${y1} L${midX},${bookendMidY} L${finishX},${bookendMidY}`} fill="none" stroke={connectorColor} strokeWidth="1.5"/>;
          })()}
        </g>

        {/* ── Start bookend ── */}
        {!hideStart && (
        <g style={{}}>
        <rect
          x={PAD_X} y={PAD_Y}
          width={BOX} height={BOX}
          fill="none" stroke={connectorColor}
          strokeWidth="1.5" rx="0"
          style={{ opacity: 0.2, animation: `node-fill-in ${REVEAL_DUR}ms ease-out 0ms 1 forwards` }}
        />
        <g transform={`translate(${PAD_X + flagCX}, ${PAD_Y + flagCY}) scale(${flagW / 18}, ${flagH / 22})`}
           style={{ opacity: 0, animation: `node-fill-in ${REVEAL_DUR}ms ease-out 0ms 1 forwards` }}>
          <path d={startPath} fill={startFlagColor}/>
        </g>
        </g>
        )}{visible.map((nk, col) => {
          const x         = pathOffsetX + col * colStep;
          const colAnimIdx = col + 1; // unused, kept for reference
          const chosenIdx = visitedMap.get(nk) ?? -1;
          const isKillCol  = nk === killNodeKey;
          const nodeData   = QUESTIONS.find(q => q.nodeKey === nk);
          // Also red if chosen answer has warn:true (first or second bad answer)
          const chosenIsWarn = chosenIdx >= 0 && !!nodeData?.answers[chosenIdx]?.warn;
          const rowCount  = nodeData?.answers.length ?? 3;
          const hasNext   = col < visible.length - 1;
          const nextChosenIdx = hasNext ? (visitedMap.get(visible[col + 1]) ?? -1) : -1;

          const isFirst = col === 0;
          const isLast  = col === visible.length - 1;

          return (
            <g key={nk}>
              {/* ── Stroke layer ── */}
              {/* ── Boxes: 20% at start, flicker to 100% when connector arrives ── */}
              {Array.from({ length: rowCount }).map((_, row) => {
                const y = PAD_Y + row * BOX;
                const chosen = row === chosenIdx;
                const kill = (isKillCol && chosen) || (chosenIsWarn && chosen);
                const { stroke } = boxStyle(chosen, kill);
                return (
                  <rect
                    key={row}
                    x={x} y={y} width={BOX} height={BOX}
                    fill="none" stroke={stroke} strokeWidth="1.5" rx="0"
                    style={boxRevealStyle(col + 1)}
                  />
                );
              })}

              {/* ── Connectors: 20% at start, clip-wipe left→right after box phase ── */}
              {(() => {
                const cd = connDelay(col + 1);
                const clipId = `conn-clip-${col}`;

                // Build entire connector as a single <path> with one clipPath bounding box wipe
                const mkConnector = (pts: [number,number][]) => {
                  if (pts.length < 2) return null;
                  const d = pts.map((p, i) => `${i===0?'M':'L'}${p[0]},${p[1]}`).join(' ');
                  // Bounding box of all points for clipPath
                  const xs = pts.map(p => p[0]);
                  const ys = pts.map(p => p[1]);
                  const bx = Math.min(...xs) - 2;
                  const by = Math.min(...ys) - 2;
                  const bw = Math.max(...xs) - bx + 2;
                  const bh = Math.max(...ys) - by + 2;
                  return (
                    <>
                      <defs>
                        <clipPath id={clipId}>
                          <rect
                            x={bx} y={by} width={bw} height={bh}
                            style={{
                              transformBox: "fill-box",
                              transformOrigin: "left center",
                              transform: "scaleX(0)",
                              animation: `clip-wipe-scale ${CONN_DUR}ms linear ${cd}ms 1 forwards`,
                            }}
                          />
                        </clipPath>
                      </defs>
                      {/* Clip-revealed full opacity connector */}
                      <path d={d} fill="none" stroke={connectorColor} strokeWidth="1.5" clipPath={`url(#${clipId})`}/>
                    </>
                  );
                };

                const pts: [number,number][] = [];

                // INCOMING connector only: from previous node to this node
                if (col === 0) {
                  // From start bookend to col 0 (skip when hideStart)
                  if (!hideStart) {
                    const targetY = PAD_Y + (chosenIdx >= 0 ? chosenIdx : 1) * BOX + BOX / 2;
                    const midX = PAD_X + BOX + COL_GAP / 2;
                    if (bookendMidY === targetY) {
                      pts.push([PAD_X + BOX, bookendMidY], [pathOffsetX, bookendMidY]);
                    } else {
                      pts.push([PAD_X + BOX, bookendMidY], [midX, bookendMidY], [midX, targetY], [pathOffsetX, targetY]);
                    }
                  }
                } else {
                  // From col-1 to col
                  const prevNk = visible[col - 1];
                  const prevChosenIdx = visitedMap.get(prevNk) ?? 1;
                  const prevX = pathOffsetX + (col - 1) * colStep;
                  const y1 = PAD_Y + prevChosenIdx * BOX + BOX / 2;
                  const y2 = PAD_Y + (chosenIdx >= 0 ? chosenIdx : 1) * BOX + BOX / 2;
                  const midX = prevX + BOX + COL_GAP / 2;
                  if (prevChosenIdx === (chosenIdx >= 0 ? chosenIdx : 1)) {
                    pts.push([prevX + BOX, y1], [prevX + BOX + COL_GAP, y1]);
                  } else {
                    pts.push([prevX + BOX, y1], [midX, y1], [midX, y2], [prevX + BOX + COL_GAP, y2]);
                  }
                }

                return pts.length >= 2 ? mkConnector(pts) : null;
              })()}

              {/* ── Fill + content layer: invisible, flicker in after stroke ── */}
              <g style={fillLayerStyle(col + 1)}>
                {Array.from({ length: rowCount }).map((_, row) => {
                  const y = PAD_Y + row * BOX;
                  const chosen = row === chosenIdx;
                  const kill = (isKillCol && chosen) || (chosenIsWarn && chosen);
                  const { fill, fg } = boxStyle(chosen, kill);
                  const isBinary = !!nodeData?.binary;
                  const binSymbols = ["✓", "✗", "≠"];
                  // On GB: all cells show letters (chosen shows screen color on dark fill)
                  const showSymbol = isBinary && !kill;
                  const showLetter = !showSymbol;

                  return (
                    <g key={row}>
                      {fill !== "none" && (
                        <rect x={x} y={y} width={BOX} height={BOX} fill={fill} stroke="none" rx="0"/>
                      )}
                      {showSymbol && (
                        <text x={x + BOX/2} y={y + BOX/2 + 11} textAnchor="middle" fontSize="30"
                          fontFamily='"T-Star Mono", monospace' fontWeight="500" fill={fg}>
                          {binSymbols[row]}
                        </text>
                      )}
                      {showLetter && (
                        <text x={x + BOX/2} y={y + BOX/2 + 11} textAnchor="middle" fontSize="30"
                          fontFamily='"T-Star Mono", monospace' fontWeight="500" fill={fg}>
                          {String.fromCharCode(65 + row)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Warning icon below column — animates with fill layer */}
              {chosenIdx >= 0 && nodeData?.answers[chosenIdx]?.warn && (
                <g style={fillLayerStyle(col + 1)}>
                  {(() => {
                    const wW = 25; const wH = 23;
                    const wx = x + (BOX - wW) / 2;
                    const wy = PAD_Y + 3 * BOX + 16;
                    return (
                      <g transform={`translate(${wx},${wy}) scale(${wW/36},${wH/32})`}>
                        <path d="M14.1494 2.02051C15.6836 -0.673553 19.5663 -0.673405 21.1006 2.02051L34.7197 25.9365C36.1907 28.5198 34.4297 31.7095 31.5283 31.9062L31.2441 31.916H4.00586L3.72168 31.9062C0.914057 31.7156 -0.826287 28.7225 0.397461 26.1885L0.530273 25.9365L14.1494 2.02051ZM16.2695 23.2324V25.9365H19V23.2324H16.2695ZM17.6738 7.47656C17.3792 7.47656 17.136 7.58019 16.9453 7.78809C16.772 7.97875 16.6855 8.22194 16.6855 8.5166V20.2949C16.6857 20.5894 16.772 20.8409 16.9453 21.0488C17.136 21.2395 17.3792 21.335 17.6738 21.335C17.951 21.3349 18.1854 21.2394 18.376 21.0488C18.5838 20.8409 18.6874 20.5894 18.6875 20.2949V8.5166C18.6875 8.22193 18.584 7.97876 18.376 7.78809C18.1854 7.5802 17.951 7.47663 17.6738 7.47656Z" fill={connectorColor}/>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* kill node marker — connector stops here, no text label */}
            </g>
          );
        })}

        {/* ── Finish bookend: single box after last path node, FinishFlag top-aligned ── */}
        {!killNodeKey && (() => {
          const lastChosen = visitedMap.get(visible[visible.length - 1]) ?? 1;
          const lastMidY   = PAD_Y + lastChosen * BOX + BOX / 2;
          const midX       = finishX - COL_GAP / 2;
          const finBoxFill = isWin ? (GB ? GBdark : "#000") : "none";
          const finBoxStroke = GB ? GBdark : connectorColor;
          return (
            <g style={fillLayerStyle(totalCols + 1)}>
              {lastMidY === bookendMidY ? (
                <line x1={pathOffsetX + (totalCols - 1) * colStep + BOX} y1={lastMidY} x2={finishX} y2={lastMidY} stroke={connectorColor} strokeWidth="1.5"/>
              ) : (
                <>
                  <line x1={pathOffsetX + (totalCols-1)*colStep+BOX} y1={lastMidY} x2={midX} y2={lastMidY} stroke={connectorColor} strokeWidth="1.5"/>
                  <line x1={midX} y1={lastMidY} x2={midX} y2={bookendMidY} stroke={connectorColor} strokeWidth="1.5"/>
                  <line x1={midX} y1={bookendMidY} x2={finishX} y2={bookendMidY} stroke={connectorColor} strokeWidth="1.5"/>
                </>
              )}
              <rect
                x={finishX} y={PAD_Y}
                width={BOX} height={BOX}
                fill={finBoxFill} stroke={finBoxStroke}
                strokeWidth="1.5" rx="0"
              />
              <g transform={`translate(${finishX + flagCX}, ${PAD_Y + flagCY}) scale(${flagW / 18}, ${flagH / 22})`}>
                <path d={finishPath} fill={GB ? "#889D58" : finishFlagColor}/>
              </g>
            </g>
          );
        })()}      </svg>
    </div>
  );
}

// ── About section ─────────────────────────────────────────────────────────────

const ABOUT_CARDS: {
  id: string; eyebrow: string; title: string; body: string; expandedBody: string;
  ctaLabel: string; ctaHref: string | undefined; bg: string; dark: boolean; gbScreen?: boolean;
  article?: React.ReactNode;
}[] = [
  {
    id: "rpg",
    eyebrow: "FIT RPG",
    title: "Why a quiz game about role fit?",
    body: "Hiring a designer is hard. I need it to be easier. Even if that's not me.",
    expandedBody: "",
    ctaLabel: "More",
    ctaHref: undefined as string | undefined,
    bg: "#889D58",
    dark: true,
    gbScreen: true,
    article: (() => {
      const gc = "#3A4324";
      const h2: React.CSSProperties = { fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:30, lineHeight:"39px", color:gc, margin:"20px 0 8px" };
      const body: React.CSSProperties = { fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:16, lineHeight:"24px", color:gc, margin:"0 0 12px" };
      const bold: React.CSSProperties = { fontWeight:700 };
      return (
        <div>
          <p style={body}>
            So why the quiz? Because <span style={bold}>I FRICKIN CAN NOW! AMIRIGHT! AI!</span> It&apos;s true, a few years ago I&apos;d be looking at minimum $100k quotes to make this site. Things <span style={bold}>are</span> different. But the real reason is super simple:
          </p>

          <h3 style={h2}>Hiring a designer is hard. I need it to be easier. Even if that&apos;s not me.</h3>

          <p style={body}>
            We&apos;ve all been there. Playing telephone on Microsoft&apos;s FaceBook, first point of contact is some outdated catch-all job description. Just to sort out what&apos;s actually important, if the candidate has it... and now with AI? <span style={bold}>Fuggetaboutit!</span> The cold reality is that people are agreeable and adaptive by nature. It&apos;s easy to talk each other into a <span style={bold}>bad fit.</span>
          </p>
          <p style={body}>
            Six months later, they leave, you&apos;re looking to backfill ASAP and it&apos;s not looking like you&apos;ll get headcount until next year. Leadership wants answers. Everybody did their job.
          </p>
          <p style={body}>
            So what happened? Was it comp? A bad JD? Rushed timeline? Recruiting? Culture fit? Are we not cool anymore? Is it AI? <span style={bold}>IT&apos;S AI ISN&apos;T IT?!!?!?</span> (Possibly)
          </p>
          <p style={body}>
            So, how do you sort out these fashionable organizers? How do you convince them to pick YOU?
          </p>

          <h3 style={h2}>Should we just go for the desperate ones?!</h3>

          <p style={body}>
            Maybe. &quot;There&apos;s a cork for every bottle&quot; my mom would say. Onward!
          </p>
          <p style={body}>
            Now you found them — but how will you know if they&apos;re the real deal? Have they actually helped anyone make anything useful? Is there a test? Who could grade such a test?
          </p>
          <p style={body}>
            A good designer isn&apos;t fooled by foosball or a walk-score. So how do you GET them?
          </p>
          <p style={body}>
            <span style={bold}>Role Preference Guide</span> (RPG) helps illustrate some common contradictions of hiring, and narrows down the two most important things:<br/>
            1. What you actually need.<br/>
            2. Is it attainable?<br/>
            My theory is if you know those two things, it&apos;s more likely you will succeed.
          </p>
        </div>
      );
    })(),
  },
  {
    id: "zero-to-one",
    eyebrow: "0→1",
    title: "Design + Prototype & Build.",
    body: "Why have 5 people do the job of one? Strategy, UX, visual design, motion, and enough code to ship — in one person.",
    expandedBody: "",
    ctaLabel: "More",
    ctaHref: undefined as string | undefined,
    bg: "#fff",
    dark: false,
    article: (() => {
      const T = { fontFamily:'"T-Star Mono",monospace' } as const;
      const h2 = { ...T, fontWeight:700, fontSize:30, lineHeight:"39px", margin:"24px 0 8px", color:"#000" } as const;
      const body = { ...T, fontWeight:300, fontSize:15, lineHeight:1.7, color:"#555", margin:"0 0 16px" } as const;
      const label = (text: string) => (
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#000",color:"#fff",borderRadius:4,padding:"6px 10px",fontFamily:'"T-Star Mono",monospace',fontWeight:400,fontSize:14,lineHeight:1,marginBottom:8,boxShadow:"4px 4px 16px rgba(0,0,0,0.16)"}}>
          {text}
        </div>
      );
      const img = (src: string, lbl?: string, style?: React.CSSProperties) => (
        <div style={{position:"relative",borderRadius:16,overflow:"hidden",boxShadow:"4px 4px 16px rgba(0,0,0,0.16)",...style}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={lbl ?? ""} style={{width:"100%",display:"block",objectFit:"cover"}}/>
          {lbl && <div style={{position:"absolute",top:16,left:16}}>{label(lbl)}</div>}
        </div>
      );
      return (
        <div style={{...T,fontSize:16,color:"#000"}}>
          {/* Section 1 */}
          <h3 style={h2}>1. Initial Human Reqs</h3>
          <p style={body}>A choose-your-adventure fit quiz. Burden of fit is traditionally on employer — I put the burden on me, the employee. Must be of value regardless of fit. Must be progressive discovery. Siding with my ideal = progress. Continuous siding with my ideal = completion. Siding against = loss. Neutrality = eventual premature loss. Game must have several themes. Game and site must be objectively difficult (high friction) FE/visual scope. Must be responsive. Accessible as possible.</p>

          {/* Section 2 */}
          <h3 style={h2}>2. AI + Human Colab. Reqs</h3>
          <p style={body}>3 options per question, 7 rounds of questions. About 10 total. Goal 4–5 losses to complete. Game scope/size/length must be discovered through failure (no hints). Some questions are 'costume' (no weight to loss/completion). Some questions have more −1/−2 weights towards (sudden) loss. Game must feel harsh, but objectively fair. Must be 99% React/Typescript (avoid assets for buttons/cards etc).</p>
          {img("/images/About/node-wires.png","Model Node Wires",{margin:"0 0 24px"})}

          {/* Section 3 */}
          <h3 style={h2}>3. Human Visual Iteration</h3>
          <p style={body}>Initially an Avatar would convey sentiment and a visible life-bar would signal progress</p>
          <div style={{display:"flex",gap:32,margin:"0 0 24px",flexWrap:"wrap"}}>
            {img("/images/About/retrobuttons.png",undefined,{flex:"0 0 66px",width:66,maxWidth:66})}
            {img("/images/About/alt-retro-theme-6d4f87.png","Alt. Retro theme",{flex:"0 0 308px",width:308})}
            {img("/images/About/early-avatar-concept-7c4db0.png","Early Avatar Concept",{flex:1,minWidth:200})}
          </div>

          {/* Section 4 */}
          <h3 style={h2}>4. Building Local from Human Mocks</h3>
          <p style={body}>Accounting for Responsive. Themes & Project Templates. Individual project layouts using template. For large, high content pages made of pre-composed parts a direct link to Figma w/ auth token works best. For pages that have complex components like cards, gameboy speaker grill I find screenshots of each individual part works best. For novel components (like gameboy speaker grill & cartridge) I found breaking them up into separate chunks (top, middle, bottom) using screenshots of 'exploded' breakouts works best. Personally I've found creative explanation to be more effective than Figma MCP or Kiro's Figma Power. For a site that has lots of content variation it's helpful to keep a steering file that urges (Kiro) to build anatomically, and avoid hard-coding.</p>
          <div style={{display:"flex",gap:32,margin:"0 0 32px",flexWrap:"wrap"}}>
            {img("/images/About/standard-theme-7c4db0.png","Standard Theme",{flex:1,minWidth:200})}
            {img("/images/About/brutalism-theme-6a2059.png","Brutalism Theme",{flex:1,minWidth:200})}
            {img("/images/About/editorial-template-71abac.png","Editorial Template",{flex:1,minWidth:200})}
          </div>
          {img("/images/About/retro-theme-7501fa.png","Retro Theme",{margin:"0 0 16px"})}
          <p style={body}>- More complex animations like the button and cartridge components require a thorough breakdown of parts{"\n"}- Surprisingly most angular gradients translate smoothly with a combo of numeric and visual reference</p>
          <div style={{display:"flex",gap:32,margin:"0 0 32px",flexWrap:"wrap"}}>
            {img("/images/About/breakout-d209fd.png",undefined,{flex:1,minWidth:180})}
            {img("/images/About/buttonstack.png",undefined,{flex:1,minWidth:180,background:"#F5F5F5"})}
            {img("/images/About/button-chat-2.png",undefined,{flex:1,minWidth:180,background:"#221D26"})}
          </div>

          {/* Section 5 */}
          <h3 style={h2}>5. Adding Motion</h3>
          <p style={body}>Provide curve for 'universal' timing. Describe parameters for individual application. Find/Use Existing snippets for complex/tedious elements like the 'Blink' effect in the below example, and tune to taste. Note: Animations that have sequence & true/false dependencies are not trivial, but it's all worth it, right?!</p>
          <div style={{display:"flex",gap:32,margin:"0 0 32px",flexWrap:"wrap"}}>
            {img("/images/About/anim-1.png","3",{flex:1,minWidth:200,background:"#211C26"})}
            {img("/images/About/anim-2.png","3",{flex:1,minWidth:200})}
          </div>
          {img("/images/About/anim-gif.gif","3",{margin:"0 0 32px"})}
          <div style={{display:"flex",gap:32,margin:"0 0 16px",flexWrap:"wrap"}}>
            {img("/images/About/buttons1.gif",undefined,{flex:1,minWidth:0})}
            <div style={{flex:1,minWidth:0,borderRadius:16,background:"#f3f3f7"}}/>
            <div style={{flex:1,minWidth:0,borderRadius:16,background:"#f3f3f7"}}/>
          </div>
          <p style={body}>Physical simulation in code is deceptively token-heavy — lots of precise numbers, lots of small corrections, lots of "close but not quite." Logic is cheap. Craft is expensive.</p>

          {/* Section 6 */}
          <h3 style={h2}>6. Push w/ Git & Vercel</h3>
        </div>
      );
    })(),
  },
  {
    id: "who",
    eyebrow: "BLOG",
    title: "On AI 'Taste' And The Future",
    body: "Taste Is Not Something You Have, It's Something You Feel.",
    expandedBody: `What is taste? Who has it? Can AI have it? All this talk about taste! Tastemakers and taste-havers! "AI doesn't have it! That's all we have left" (I wouldn't be so sure).

Most people think of taste as something others who create or produce have. Fancy people like Enzo Ferrari, Coco Chanel, Dieter Rams, or Ke$ha.

So what do Dieter, Coco, Enzo and *Ke$ha have in common? Do they just 'know' when something feels right? Do they have that 'eye' or that 'ear'? Do they know something us mortals don't? Probably! But, it isn't taste.

Taste is actually the label we, the consumer, put on someone else's rigor. What those geniuses (Ke$ha's IQ: 140) have is a highly developed systematic application of rules (do's and don'ts), often resulting in novel permutations.

Can AI have taste? Can we 'train' taste? Yes and no.

The problem with 'training' taste is that, by definition, this means giving models gobs and gobs of data. This is actually what results in things feeling generic and 'tasteless'. But taste can be 'taught' or defined, and if you ask any expert: it's not just what you do, but what you don't do.

If you take Ke$ha and the gang, what they have is a simple, distilled formula of what to do and what not to do, along with a sensitivity and desire for feedback. Enzo said it's all about the engine and competition: no aerodynamics, no collaboration: "aerodynamics is for people who can't build engines". He didn't care about 'reliability' either: it just needs to get through the race, winning or losing was the feedback. Ke$ha said you don't need a polished image or critical acclaim: she had a formula and she didn't care what the formula looked like to people who weren't inside it. If critics hated it, to her that was clear signal it was working. Dieter Rams (Braun) watched hordes of companies pump out cheap plastic gizmos with buttons, dials, wires and blinking lights: he said you don't need it, just 'polish'. To Dieter, the noise of the 1960s was feedback.

So if we want to teach AI taste, it isn't about a 'world of knowledge' or zillions of examples: we simply have to tell it what few concrete rules matter and give it quality, pointed feedback.

The cool thing is that, with patience and persistence, identifying those rules and clarifying them to create an agent is a wonderful, symbiotic process. As you struggle to articulate the rules, you end up understanding them better. While at Amazon, I spent 2 months teaching an agent to make 150 of the most common icons, exactly as I would (and let me tell you, I'm a stickler). I can't imagine making any of those 150 icons by hand ever again. I only want to make the ones it can't — yet.`,
    ctaLabel: "More",
    ctaHref: undefined as string | undefined,
    bg: "#fff",
    dark: false,
  },
];

function AboutCard({ card, defaultOpen, onPlay }: { card: typeof ABOUT_CARDS[0]; defaultOpen?: boolean; onPlay?: () => void }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const fg = card.gbScreen ? "#3A4324" : card.dark ? "rgba(255,255,255,0.9)" : "#111";
  const fgMuted = card.gbScreen ? "#3A4324" : card.dark ? "rgba(255,255,255,0.6)" : "#555";
  const border = card.gbScreen ? "#3A4324" : card.dark ? "rgba(255,255,255,0.15)" : card.bg !== "#fff" ? "rgba(0,0,0,0.3)" : "var(--border)";
  const cardShadow = card.gbScreen
    ? "inset 1px 1px 0 rgba(255,255,255,0.6), inset 8px 8px 16px rgba(56,60,131,0.36), inset -8px -8px 16px rgba(151,149,74,1), 4px 4px 16px rgba(0,0,0,0.16)"
    : "4px 4px 16px rgba(0,0,0,0.16)";

  return (
    <div id={`about-card-${card.id}`} style={{
      background: card.bg,
      borderRadius: 24,
      padding: 32,
      marginBottom: 32,
      position: "relative",
      border: card.dark ? "none" : "1px solid var(--border)",
      overflow: "hidden",
      boxShadow: cardShadow,
    }}>
      {/* Eyebrow */}
      <div style={{
        fontFamily:'"T-Star Mono",monospace', fontWeight:500, fontSize:12,
        letterSpacing:"0.14em", textTransform:"uppercase",
        color: fg, marginBottom:8,
        borderBottom: `1px solid ${border}`, paddingBottom:6, display:"inline-block",
      }}>
        {card.eyebrow}
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily:'"T-Star Mono",monospace', fontWeight:500, fontSize:30,
        lineHeight:1.2, color: fg, margin:"8px 0 10px",
      }}>
        {card.title}
      </h2>

      {/* Body */}
      <p style={{
        fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:15,
        lineHeight:1.7, color: fg, margin:0,
      }}>
        {card.body}
      </p>

      {/* Expanded content */}
      {open && (
        <div style={{marginTop:16}}>
          {card.article ? card.article : card.expandedBody.split("\n\n").map((para, i) => (
            <p key={i} style={{
              fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:15,
              lineHeight:1.8, color: fgMuted, margin:"0 0 16px",
            }}>
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Bottom row: primary CTA + optional Play */}
      <div style={{display:"flex", alignItems:"center", gap:12, marginTop:24}}>
        {/* Primary CTA — Learn More / Less */}
        <button
          className="about-pill-btn"
          onClick={() => setOpen(o => !o)}
          style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background: open ? "#fff" : "#FFD000",
            color: "#111",
            border: "1px solid rgba(255,255,255,0.9)",
            borderRadius:999,
            height:40, padding:"0 16px",
            fontFamily:'"T-Star Mono",monospace', fontSize:15, fontWeight:500,
            cursor:"pointer", transition:"background 0.15s, color 0.15s",
            boxShadow: "4px 4px 16px rgba(0,0,0,0.16)",
          }}
        >
          {open ? "Less" : card.ctaLabel}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path d="M10.75 19.457L1.604 10.311C1.409 10.115 1.409 9.799 1.604 9.603L10.75 0.457M2 9.957H22.793"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            ) : (
              <path d="M13.25 0.457L22.396 9.603C22.591 9.799 22.591 10.115 22.396 10.311L13.25 19.457M22 9.957H1.207"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            )}
          </svg>
        </button>
        {/* Secondary CTA — Play (RPG card only) */}
        {onPlay && (
          <button
            className="about-pill-btn"
            onClick={onPlay}
            style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"#3A4324", color:"#fff",
              border:"1px solid rgba(255,255,255,0.9)",
              borderRadius:999,
              height:40, padding:"0 16px",
              fontFamily:'"T-Star Mono",monospace', fontSize:15, fontWeight:500,
              cursor:"pointer", transition:"background 0.15s, color 0.15s",
              boxShadow:"4px 4px 16px rgba(0,0,0,0.16)",
            }}
          >
            Play
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13.25 0.457L22.396 9.603C22.591 9.799 22.591 10.115 22.396 10.311L13.25 19.457M22 9.957H1.207"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ── FAQ Section ───────────────────────────────────────────────────────────────
const FAQ_ITEMS: { q: string; a: string; expanded?: boolean }[] = [
  { q: "Do you use AI to Do Layout?",        a: "No. Paper + Figma." },
  { q: "Do you use AI to Build?",            a: "Yes. 100% of code is IDE." },
  { q: "Do you use AI for images?",          a: "*No. Customers value consistency and authenticity of content, as opposed to the authenticity of code (for example). *Product rendering" },
  { q: "Do you use AI for Motion?",          a: "Yes. Curves & timing are set then applied as a template. Motion is wonderful, but time consuming, and so ripe for agentic automation. There is a product in the works!" },
  { q: "What IDE do you use to build?",      a: "Kiro" },
  { q: "What models do you use to build?",   a: "Claude Sonnet 4.6 on 'High' I've found it is the perfect 'builder'. In my experience 'Smarter' models like Opus 5 are too unbound in capability and are better suited for high inference, agentic work (like making an Icon agent)." },
  { q: "Do you store visitor data?",         a: "No." },
  { q: "Is there an API for RPG?",           a: "Not at the moment. All answers are co-authored by AI but, are pre-written." },
  { q: "How is this site built/hosted?",     a: "Paper & Various chats with all sorts of Anthropic and Google models. Then Figma, Kiro, Photoshop, Git and Vercel." },
  { q: "Do you consult?",                    a: "I always have an opinion!" },
];

function FaqItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const shadow = "4px 4px 16px rgba(0,0,0,0.16)";

  if (!a) {
    // Yellow collapsed pill — white stroke, full touch target
    return (
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"4px 23px", height:64,
        background:"#FFD132", borderRadius:100,
        border:"1px solid rgba(255,255,255,0.9)",
        boxShadow: shadow, cursor:"pointer",
        userSelect:"none",
      }} onClick={() => setOpen(o => !o)}>
        <span style={{fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:30, lineHeight:"39px", color:"#000"}}>{q}</span>
        <ChevronIcon open={open}/>
      </div>
    );
  }

  return (
    <div style={{
      background: open ? "#fff" : "#FFD132",
      borderRadius: open ? 32 : 100,
      padding: open ? "16px 23px" : "0 23px",
      height: open ? "auto" : 64,
      display: open ? "block" : "flex",
      alignItems: open ? undefined : "center",
      border:"1px solid rgba(255,255,255,0.9)",
      boxShadow: shadow, cursor:"pointer",
      userSelect:"none",
      transition:"background 0.15s, border-radius 0.15s",
    }} onClick={() => setOpen(o => !o)}>
      <div style={{display:"flex", width:"100%", alignItems: open ? "flex-start" : "center", justifyContent:"space-between", gap:16}}>
        <span style={{fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:30, lineHeight:"39px", color:"#000", flex:1}}>{q}</span>
        <div style={{paddingTop: open ? 8 : 0, flexShrink:0}}><ChevronIcon open={open}/></div>
      </div>
      {open && (
        <p style={{fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:15, lineHeight:1.7, color:"#555", margin:"12px 0 0"}}>
          {a}
        </p>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" style={{flexShrink:0, transition:"transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(180deg)"}}>
      <path d="M12 22.043V1.25M2.25 10.543L11.397 1.397C11.592 1.201 11.909 1.201 12.104 1.397L21.25 10.543"
        stroke="#000" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// ── AboutChat ────────────────────────────────────────────────────────────────
// Four states: default pill → focused (2px stroke) → typing (multiline) → response
// Layout: input left, response right (desktop); response below (mobile)
function AboutChat({ extMessages, setExtMessages, extLoading, setExtLoading, initialQ, shouldAutoFocus }: {
  extMessages?: {q:string;a:string}[];
  setExtMessages?: React.Dispatch<React.SetStateAction<{q:string;a:string}[]>>;
  extLoading?: boolean;
  setExtLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  initialQ?: string;
  shouldAutoFocus?: boolean;
} = {}) {
  const [intMessages, setIntMessages] = useState<{q:string;a:string}[]>([]);
  const [intLoading, setIntLoading]   = useState(false);
  const messages   = extMessages   ?? intMessages;
  const setMessages= setExtMessages ?? setIntMessages;
  const loading    = extLoading    ?? intLoading;
  const setLoading = setExtLoading ?? setIntLoading;
  const [value, setValue]   = useState("");
  const [focused, setFocused] = useState(false);
  const scrollRef               = useRef<HTMLDivElement>(null);
  const initialQFired = useRef(false);

  // Auto-submit initial question from home card
  useEffect(() => {
    if (!initialQ || initialQFired.current) return;
    initialQFired.current = true;
    const q = initialQ;
    setLoading(true);
    fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({question:q}) })
      .then(r=>r.json())
      .then(data => { setMessages(m=>[...m,{q,a:data.response??data.error??"Something went wrong."}]); setLoading(false); })
      .catch(() => { setMessages(m=>[...m,{q,a:"Something went wrong. Try again."}]); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasValue    = value.trim().length > 0;
  const shadow      = "4px 4px 16px rgba(0,0,0,0.16)";
  const inputBorder = focused ? "2px solid #007AD5" : "1px solid #007AD5";
  const LINE_H      = 30;
  const MAX_LINES   = 5;
  const MIN_H       = 64;
  const MAX_H       = LINE_H * MAX_LINES + 32;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, MAX_H) + "px";
  }, [value, MAX_H]);

  // Auto-scroll conversation on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function handleSubmit() {
    if (!hasValue || loading) return;
    const q = value.trim();
    setValue("");
    setFocused(false);
    setLoading(true);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q }),
    })
      .then(r => r.json())
      .then(data => {
        setMessages(m => [...m, { q, a: data.response ?? data.error ?? "Something went wrong." }]);
        setLoading(false);
      })
      .catch(() => {
        setMessages(m => [...m, { q, a: "Something went wrong. Try again." }]);
        setLoading(false);
      });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  const chatFont: React.CSSProperties = {
    fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:16,
    lineHeight:"30px", margin:0,
  };

  const SendButton = () => (
    <div style={{
      width:36, height:36, borderRadius:"50%", flexShrink:0,
      background:"#007AD5", opacity: hasValue ? 1 : 0.5,
      display:"flex", alignItems:"center", justifyContent:"center",
      cursor: hasValue ? "pointer" : "default", transition:"opacity 0.12s",
    }} onClick={handleSubmit}>
      <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
        <path d="M13 6.5L1 6.5M7.5 1L13 6.5L7.5 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );

  const inputEl = (
    <div style={{
      display:"flex", alignItems:"flex-end", gap:10,
      background:"#fff", borderRadius:41,
      border:inputBorder, boxShadow:shadow,
      padding:"16px 12px 16px 32px",
      minHeight:MIN_H,
    }}>
      <textarea
        ref={textareaRef}
        value={value}
        rows={1}
        autoFocus={!!shouldAutoFocus}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Do you like Nirvana?"
        style={{
          flex:1, border:"none", outline:"none", background:"transparent",
          fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:16,
          lineHeight:`${LINE_H}px`, color:"rgba(0,0,0,0.6)",
          resize:"none", overflow:"auto",
          height:LINE_H, maxHeight:MAX_H,
          alignSelf:"center", padding:0,
        }}
      />
      <SendButton/>
    </div>
  );

  return (
    <div style={{width:"100%", maxWidth:800, display:"flex", flexDirection:"column", gap:16}}>

      {/* Conversation — MISHA placeholder when empty, messages when active */}
      <div ref={scrollRef} style={{
        maxHeight:300, overflowY:"auto",
        display:"flex", flexDirection:"column", gap:16,
        scrollbarWidth:"thin",
        scrollbarColor:"rgba(0,0,0,0.2) transparent",
      }}>
        {loading && messages.length === 0 && (
          <div style={{
            background:"#fff", borderRadius:"0px 41px 41px 41px",
            display:"flex", alignItems:"center", justifyContent:"center",
            padding:"16px 24px", minHeight:80, alignSelf:"flex-start",
            maxWidth:280,
          }}>
            <MishaSpinner running={true} color="#1B6EF3"/>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{display:"flex", flexDirection:"column", gap:8}}>
            <div style={{display:"flex", justifyContent:"flex-end"}}>
              <div style={{background:"#fff", borderRadius:"41px 41px 0px 41px", padding:"12px 20px"}}>
                <p style={{...chatFont, color:"rgba(0,0,0,0.6)"}}>{m.q}</p>
              </div>
            </div>
            <p style={{...chatFont, color:"rgba(0,0,0,0.8)"}}>{m.a}</p>
          </div>
        ))}
        {loading && messages.length > 0 && (
          <div style={{...chatFont, color:"rgba(0,0,0,0.4)"}}>···</div>
        )}
      </div>

      {/* Input — always at bottom */}
      {inputEl}
    </div>
  );
}

function FaqSection({ openChat }: { openChat: () => void }) {
  return (
    <div style={{marginTop:0}}>
      {/* Title block — inline, not a card */}
      <div style={{marginBottom:24}}>
        <div style={{
          fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:15,
          letterSpacing:"0.4em", textTransform:"uppercase", color:"#000",
          borderBottom:"1px solid #000", paddingBottom:6, display:"inline-block", marginBottom:8,
        }}>FAQ</div>
        <h2 style={{fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:30, lineHeight:"39px", color:"#000", margin:0}}>
          frequently asked questions
        </h2>
      </div>

      {/* Accordion items */}
      <div style={{display:"flex", flexDirection:"column", gap:24}}>
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem key={i} q={item.q} a={item.a} defaultOpen={item.expanded}/>
        ))}
      </div>

      {/* Chat CTA */}
      <div style={{marginTop:24}}>
        <div style={{marginBottom:12}}>
          <div style={{
            fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:15,
            letterSpacing:"0.4em", textTransform:"uppercase", color:"#000",
            borderBottom:"1px solid #000", paddingBottom:6, display:"inline-block", marginBottom:8,
          }}>POWERED BY CLAUDE AI</div>
          <h3 style={{fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:30, lineHeight:"39px", color:"#000", margin:"0 0 4px"}}>
            WWMD. What Would Misha Do (or say)?
          </h3>
          <p style={{fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:15, lineHeight:1.7, color:"#555", margin:0}}>
            From Nirvana to the function of design. Ask anything.
          </p>
        </div>
        {/* Chat input */}
        <AboutChat/>
      </div>
    </div>
  );
}

// ── Resume inline card ────────────────────────────────────────────────────────
const RESUME_JOBS = [
  {
    company: "Amazon",
    role: "Product Designer, AI Platform, 2024–Present",
    bullets: [
      "Built a lean icon generation agent as a Kiro Power (patent pending) — encodes design taste as model instructions",
      "Shipped a production model catalog page to mainline — designed, built with Kiro, and merged through standard code review on a 70-developer codebase",
      "Led Amazon Content Partners — inherited an unshipped project, reworked the UX end-to-end, shipped v1 as sole designer",
      "Led Nova Builder Studio (showcased at re:Invent) — designed a CMS that converted Quip documents to Nova Design System specs, enabling content publishing without design handoff",
      "Created the Nova icon library; shaped overall look & feel and designed multiple navigation iterations across the product",
      "Designed UI/UX for Nova Sonic (audio chat); contributed to model onboarding patterns: list views, edit/view forms, field schemas",
    ],
    description: "Most recently, I've been focused on proving that the traditional five-person product team is increasingly unnecessary if you have the right instincts and tooling.",
    viewProject: "/",
  },
  {
    company: "Neon Machine / Shrapnel",
    role: "Lead Product Designer, 2022–2024",
    bullets: ["Product Owner & Creator, Online NFT marketplace for PC Extraction Shooter", "Created E2E browsing, promotion, search, payment, navigation, filtering, buy, sell, auction & accounts-management experiences", "Contributed to player-profile, transfers, leaderboard, questing, inventory & RNG item-recycling features", "Created SHRAPNEL Design System Figma library for game & web: UI, font ramp, iconography, Figma component library", "Wrote notification-system product doc for SHRAPNEL & Mercury Platform"],
    description: "Responsibilities: conduct walkthroughs & reviews, write product definition docs, define data models, write QA test-scripts, define art needs, create mocks & wires, plan sprints, conduct competitive research & define OKRs & analytics needs for web. Daily collab with tech director, game UX director, EXP devs, CMO, producers, swim-lane leads & art director.",
  },
  {
    company: "Expedia",
    role: "Sr. Product Designer, 2021–2022",
    bullets: ["Lead, Service Platform Design Team", "Envision & evangelize product strategy for post-pandemic service model", "Lead designer Expedia White Label Template (site builder automation)"],
    description: "Responsibilities: facilitate org-level product strategy, concept company content service models, roadmap & sprint planning, Figma mocks & protos, use & contribute to token-based component system. Coordinate workshops, swarms, working sessions, presentations and form collaborative relationships.",
  },
  {
    company: "Walmart & Sam's Club",
    role: "Sr. UX Designer, 2020–2021",
    bullets: ["Redesign Walmart & Sam's Club car-wash kiosk interface", "Flows, wires, protos, static & animated assets", "Coordinate with Walmart Fuel Team, hardware vendors and devs", "Lead design for internal Augmented Reality Inventory app"],
  },
  {
    company: "Funko",
    role: "Sr. UX Designer, 2019–2020",
    bullets: ["Full site redesign focusing on e-commerce & standardization", "Provide style-guide with component & page templates", "Coordinate with CMO, spec & review features based on business goals", "Drive company focus to mobile, accessibility, data and automation"],
  },
  {
    company: "Indigo Slate",
    role: "Sr. Designer, 2018–2019",
    bullets: ["Lead design and illustrator for Dell Interactive Mural", "Drive dev, PM, SMI and animators time-lines", "Responsive design scale from installation to desktop & mobile", "Lead for Sony Alpha Universe managed service", "Create shoppable and marketing experiences on sonyalpha.com"],
  },
  {
    company: "Deloitte",
    role: "Sr. Designer, 2017",
    bullets: ["Lead Deloitte Digital site redesign", "Created UI style-guide, page templates and development specs", "Lead points based Jira sprints & stakeholder reviews", "Guide team of off-shore developers and in-house designers"],
  },
  {
    company: "Microsoft",
    role: "UX Designer, 2014–2017",
    bullets: ["Style guide & specs for all-up Dynamics CRM product group", "Lead designer for CRM mobile and various web portals", "Feature owner of CRM Business Process & Help Portals", "UI redesign for CRM in Outlook for web", "Visual & UI design of Bing Mobile Image Search", "Design support for XBoxONE launch team — storyboard & animation for in-product teaser video"],
  },
  {
    company: "BFA, Design",
    role: "Cornish College of the Arts, 2012",
  },
] as const;

function ResumeInlineCard() {
  const [open, setOpen] = useState(false);
  const [openJob, setOpenJob] = useState(0);
  const shadow = "4px 4px 16px 0px rgba(0,0,0,0.16)";
  const font   = '"T-Star Mono",monospace';

  if (!open) {
    return (
      <div style={{ background:"#fff", borderRadius:36, padding:36, boxShadow:shadow, marginBottom:32, fontFamily:font, color:"#000" }}>
        {/* Eyebrow */}
        <div style={{ marginBottom:12 }}>
          <div style={{ fontFamily:font, fontWeight:500, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", color:"#000", borderBottom:"1px solid #000", paddingBottom:6, display:"inline-block" }}>Resume</div>
        </div>
        {/* Company list */}
        <div style={{ fontSize:30, fontWeight:700, lineHeight:"39px", marginBottom:8 }}>
          Amazon | Neon Machine | Expedia | Walmart | Funko | Deloitte | Microsoft | +
        </div>
        {/* Subtitle */}
        <div style={{ fontSize:16, lineHeight:"24px", marginBottom:24 }}>
          10+ Years of momentum, strategy, and empathy. UX + Visual + Motion + IDE.
        </div>
        {/* Footer row */}
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {/* See More pill */}
          <button onClick={() => setOpen(true)} style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px", height:40, borderRadius:100, background:"#FFD132", border:"1px solid #fff", boxShadow:shadow, cursor:"pointer", fontFamily:font, fontSize:15, fontWeight:700, color:"#000" }}>
            See Resumé
            <img src="/icons/resume-see-more-arrow.svg" width={15} height={13} alt="" style={{ display:"block" }}/>
          </button>
          {/* Share icon — right-aligned */}
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
            <button style={{ width:40, height:40, borderRadius:"50%", background:"#fff", border:"1px solid #000", boxShadow:shadow, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <img src="/icons/resume-download.svg" width={17} height={16} alt="Share" style={{ display:"block" }}/>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Open / expanded state
  return (
    <div style={{ background:"#fff", borderRadius:36, padding:36, boxShadow:shadow, marginBottom:32, fontFamily:font, color:"#000" }}>
      {/* Eyebrow */}
      <div style={{ marginBottom:8 }}>
        <div style={{ fontFamily:font, fontWeight:500, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", color:"#000", borderBottom:"1px solid #000", paddingBottom:6, display:"inline-block" }}>Resume</div>
      </div>
      <div style={{ fontSize:30, fontWeight:700, lineHeight:"39px", marginBottom:24 }}>10+ Years</div>

      {/* Timeline */}
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {RESUME_JOBS.map((job, i) => {
          const isOpen = openJob === i;
          const isLast = i === RESUME_JOBS.length - 1;
          return (
            <div key={job.company} style={{ display:"flex", gap:12, alignItems:"stretch" }}>
              {/* Node + connector */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:40, flexShrink:0 }}>
                <button
                  onClick={() => setOpenJob(prev => prev === i ? -1 : i)}
                  aria-label={isOpen ? `Collapse ${job.company}` : `Expand ${job.company}`}
                  style={{ width:40, height:40, borderRadius:"50%", border:"1.5px solid #000", background: isOpen ? "#FFD132" : "#fff", color: "#000", boxShadow:shadow, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", padding:0, transition:"background 200ms ease, color 200ms ease" }}
                  className={`resume-node-btn${isOpen ? " open" : ""}`}
                >
                  {/* Arrow: down when open, right when closed */}
                  <svg width="18" height="21" viewBox="0 0 18 21" fill="none" style={{ display:"block", transition:"transform 250ms cubic-bezier(0.4,0,0.2,1)", transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>
                    <path d="M0.768292 11.533L8.65842 20.0946C8.82686 20.2774 9.09996 20.2774 9.2684 20.0946L17.1585 11.533M8.96341 20.2317L8.96341 0.768292" stroke="currentColor" strokeWidth="1.53659" strokeLinecap="round"/>
                  </svg>
                </button>
                {/* Connector — animates height via flex */}
                {!isLast && (
                  <div style={{
                    flex: 1,
                    width: 0,
                    borderLeft: "1.5px solid #000",
                    margin: "0",
                    transition: "opacity 200ms ease",
                    opacity: 1,
                  }}/>
                )}
              </div>
              {/* Content */}
              <div style={{ flex:1, paddingBottom: isLast ? 8 : 24, display:"flex", flexDirection:"column", gap:8, minWidth:0 }}>
                <div>
                  <div style={{ fontSize:30, fontWeight: isOpen ? 700 : 400, lineHeight:"39px", transition:"font-weight 0ms" }}>{job.company}</div>
                  {job.role && <div style={{ fontSize:16, fontWeight:400, lineHeight:"24px" }}>{job.role}</div>}
                </div>
                {/* Expandable content — grid-rows trick for smooth height animation */}
                <div style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)",
                  overflow: "hidden",
                }}>
                  <div style={{ overflow:"hidden", display:"flex", flexDirection:"column", gap:8 }}>
                    {"bullets" in job && job.bullets && (
                      <div style={{ fontSize:16, lineHeight:"24px", paddingTop:4 }}>
                        {(job.bullets as readonly string[]).map((b: string) => <div key={b}>• {b}</div>)}
                      </div>
                    )}
                    {"description" in job && job.description && (
                      <div style={{ fontSize:16, lineHeight:"24px" }}>{job.description as string}</div>
                    )}
                    {"viewProject" in job && job.viewProject && (
                      <a href={job.viewProject as string} style={{ fontSize:16, fontWeight:700, color:"#007AD5", lineHeight:"24px" }}>View Project</a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ display:"flex", gap:16, alignItems:"center", marginTop:8 }}>
        <button onClick={() => setOpen(false)} style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px", height:40, borderRadius:100, background:"#FFD132", border:"1px solid #fff", boxShadow:shadow, cursor:"pointer", fontFamily:font, fontSize:15, fontWeight:700, color:"#000" }}>
          Close
          <img src="/icons/resume-close-arrow.svg" width={15} height={13} alt="" style={{ display:"block" }}/>
        </button>
        <button style={{ display:"flex", alignItems:"center", gap:10, padding:"0 16px", height:40, borderRadius:100, background:"#fff", border:"1px solid #FFD132", boxShadow:shadow, cursor:"pointer", fontFamily:font, fontSize:15, fontWeight:700, color:"#000" }}>
          Download
          <img src="/icons/resume-download.svg" width={17} height={16} alt="" style={{ display:"block" }}/>
        </button>
      </div>
    </div>
  );
}

// ── BrutalAboutSection ────────────────────────────────────────────────────────
function BrutalAboutSection({ onClose, openChat, initialOpenId }: { onClose: () => void; openChat: () => void; initialOpenId?: string }) {
  const font = '"T-Star Mono",monospace';
  const [chatInput, setChatInput] = useState("");

  // Expandable body for BLOG / article cards — LEARN MORE wired externally
  // This component just renders the content with smooth grid-rows animation
  function BrutalResumeCard() {
    const [open, setOpen] = useState(false);
    const [openJob, setOpenJob] = useState(0); // Amazon open by default
    return (
      <>
        {/* Whole timeline — smooth reveal */}
        {open && <>
          <div className="bc-eyebrow">RESUME</div>
          <div style={{fontFamily:font,fontWeight:700,fontSize:30,lineHeight:1.2,borderBottom:"1px solid #000",boxSizing:"border-box",padding:"8px 0"}}>
            10+ Years
          </div>
          {RESUME_JOBS.map((job, i) => {
              const isOpen = openJob === i;
              const hasBullets = "bullets" in job && (job as {bullets?: readonly string[]}).bullets;
              return (
                <div key={job.company} style={{borderBottom:"1px solid #000",boxSizing:"border-box"}}>
                  <div className="bc-cta-wrap" style={{marginTop:0,marginBottom:-1}}>
                    <BrutalShadow block>
                      <div onClick={()=>hasBullets?setOpenJob(j=>j===i?-1:i):undefined}
                        className="bc-cta"
                        style={{cursor:hasBullets?"pointer":"default",
                          padding:0,gap:0,alignItems:"stretch"}}>
                        <div style={{width:64,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <span style={{display:"inline-block",transition:"transform 200ms ease",
                            transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>
                            <ArrowRight size={20}/>
                          </span>
                        </div>
                        <div style={{flex:1,borderLeft:"1px solid #000",boxSizing:"border-box",
                          display:"flex",flexDirection:"column",justifyContent:"center",
                          padding:"8px 24px",gap:2,background:"#fff"}}>
                          <div style={{fontFamily:font,fontWeight:700,fontSize:30,lineHeight:1.2}}>{job.company}</div>
                          {job.role && <div style={{fontFamily:font,fontWeight:700,fontSize:15,lineHeight:1.6}}>{job.role}</div>}
                        </div>
                      </div>
                    </BrutalShadow>
                  </div>
                  <div style={{display:"grid",gridTemplateRows:isOpen?"1fr":"0fr",transition:"grid-template-rows 300ms cubic-bezier(0.4,0,0.2,1)",overflow:"hidden"}}>
                    <div style={{overflow:"hidden"}}>
                      <div style={{display:"flex",gap:32,padding:"16px 24px 16px 88px",borderTop:"1px solid #000",boxSizing:"border-box"}}>
                        <div style={{flex:1,display:"flex",flexDirection:"column",gap:4}}>
                          {hasBullets && ((job as {bullets:readonly string[]}).bullets).map((b,bi)=>(
                            <div key={bi} style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6}}>• {b}</div>
                          ))}
                          {"viewProject" in job && (job as {viewProject?:string}).viewProject && (
                            <a href={(job as {viewProject:string}).viewProject}
                              style={{fontFamily:font,fontWeight:700,fontSize:15,color:"#007AD5",marginTop:4}}>
                              View Project
                            </a>
                          )}
                        </div>
                        {"description" in job && (job as {description?:string}).description && (
                          <div style={{flex:1,fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6}}>
                            {(job as {description:string}).description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );            })}
          <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
            <div style={{flex:1,overflow:"visible"}}>
              <BrutalShadow block>
                <div className="bc-cta" onClick={()=>setOpen(false)} style={{cursor:"pointer"}}>
                  <span>CLOSE</span><ArrowRight size={20}/>
                </div>
              </BrutalShadow>
            </div>
            <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
              <BrutalShadow block>
                <div className="bc-cta" style={{justifyContent:"center",padding:0}}>
                  <Icon name="share" size={20}/>
                </div>
              </BrutalShadow>
            </div>
          </div>
        </>}

        {/* Resumé CTA — hidden when open */}
        {!open && (
          <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
            <div style={{flex:1,overflow:"visible"}}>
              <BrutalShadow block>
                <div className="bc-cta" onClick={()=>setOpen(true)} style={{cursor:"pointer"}}>
                  <span>Resumé</span><ArrowRight size={20}/>
                </div>
              </BrutalShadow>
            </div>
            <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
              <BrutalShadow block>
                <div className="bc-cta" style={{justifyContent:"center",padding:0}}>
                  <Icon name="share" size={20}/>
                </div>
              </BrutalShadow>
            </div>
          </div>
        )}
      </>
    );
  }
  // Expandable card for non-who non-rpg cards (e.g. zero-to-one with article JSX)
  function BrutalArticleExpand({ card, defaultOpen }: { card: {id:string; article?: React.ReactNode}; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(!!defaultOpen);
    return (
      <>
        {open && card.article && (
          <div style={{borderBottom:"1px solid #000",boxSizing:"border-box",padding:"16px 0"}}>
            {card.article}
          </div>
        )}
        <div style={{flex:1,borderBottom:"1px solid #000",boxSizing:"border-box"}}/>
        <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
          <div style={{flex:1,overflow:"visible"}}>
            <BrutalShadow block>
              <div className="bc-cta" onClick={()=>setOpen(o=>!o)} style={{cursor:"pointer"}}>
                <span>{open?"CLOSE":"LEARN MORE"}</span>
                <span style={{transform:open?"rotate(-90deg)":"rotate(0deg)",display:"inline-block",transition:"transform 200ms ease"}}>
                  <ArrowRight size={20}/>
                </span>
              </div>
            </BrutalShadow>
          </div>
          <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
            <BrutalShadow block>
              <div className="bc-cta" style={{justifyContent:"center",padding:0}}>
                <Icon name="share" size={20}/>
              </div>
            </BrutalShadow>
          </div>
        </div>
      </>
    );
  }
  function BrutalRpgExpand({ defaultOpen }: { defaultOpen?: boolean }) {
    const [open, setOpen] = useState(!!defaultOpen);
    const gc = "#3A4324";
    // Brutal text block: title-level or body-level, always border-bottom
    const BcText = ({ text, bold, bg }: { text: React.ReactNode; bold?: boolean; bg?: string }) => (
      <div style={{fontFamily:font, fontWeight:bold?700:300, fontSize:bold?30:15,
        lineHeight:bold?1.2:1.7, color:"#000", padding:"12px 0",
        borderBottom:"1px solid #000", boxSizing:"border-box" as const,
        background: bg ?? "transparent"}}>
        {text}
      </div>
    );
    return (
      <>
        <div style={{display:"grid", gridTemplateRows:open?"1fr":"0fr",
          transition:"grid-template-rows 350ms cubic-bezier(0.4,0,0.2,1)", overflow:"hidden"}}>
          <div style={{overflow:"hidden"}}>
            {/* Intro — white bg */}
            <BcText text={<>So why the quiz? Because <strong>I FRICKIN CAN NOW! AMIRIGHT! AI!</strong> It&apos;s true, a few years ago I&apos;d be looking at minimum $100k quotes. Things <strong>are</strong> different. But the real reason is super simple:</>}/>
            {/* Section heading */}
            <BcText text="Hiring a designer is hard. I need it to be easier. Even if that's not me." bold/>
            <BcText text="We've all been there. Playing telephone on Microsoft's FaceBook, first point of contact is some outdated catch-all job description. Just to sort out what's actually important... and now with AI? Fuggetaboutit! The cold reality is that people are agreeable and adaptive by nature. It's easy to talk each other into a bad fit."/>
            <BcText text="Six months later, they leave, you're looking to backfill ASAP and it's not looking like you'll get headcount until next year. Leadership wants answers. Everybody did their job."/>
            <BcText text="So what happened? Was it comp? A bad JD? Rushed timeline? Culture fit? Are we not cool anymore? Is it AI? IT'S AI ISN'T IT?!!?!? (Possibly)"/>
            <BcText text="So, how do you sort out these fashionable organizers? How do you convince them to pick YOU?"/>
            {/* Section heading */}
            <BcText text="Should we just go for the desperate ones?!" bold/>
            <BcText text={<>&quot;There&apos;s a cork for every bottle&quot; my mom would say. Onward! Now you found them — but how will you know if they&apos;re the real deal? Have they actually helped anyone make anything useful? Is there a test? Who could grade such a test?</>}/>
            <BcText text="A good designer isn't fooled by foosball or a walk-score. So how do you GET them?"/>
            <BcText text={<><strong>Role Preference Guide (RPG)</strong> helps illustrate some common contradictions of hiring, and narrows down the two most important things: what you actually need, and whether it&apos;s attainable. My theory is if you know those two things, it&apos;s more likely you will succeed.</>}/>
          </div>
        </div>
        {/* CTA row: LEARN MORE toggle + PLAY + share */}
        <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
          <div style={{flex:1,overflow:"visible"}}>
            <BrutalShadow block>
              <div className="bc-cta" onClick={()=>setOpen(o=>!o)}
                style={{background:"#3A4324",color:"#fff",borderColor:"#000",cursor:"pointer"}}>
                <span>{open?"CLOSE":"LEARN MORE"}</span>
                <span style={{transform:open?"rotate(-90deg)":"rotate(0deg)",display:"inline-block",transition:"transform 200ms ease"}}>
                  <ArrowRight size={20}/>
                </span>
              </div>
            </BrutalShadow>
          </div>
          <div style={{flex:1,overflow:"visible",marginLeft:-1}}>
            <BrutalShadow block>
              <div className="bc-cta" onClick={()=>{window.scrollTo({top:0,behavior:"smooth"});openChat();}}
                style={{cursor:"pointer"}}>
                <span>PLAY</span><ArrowRight size={20}/>
              </div>
            </BrutalShadow>
          </div>
          <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
            <BrutalShadow block>
              <div className="bc-cta" style={{justifyContent:"center",padding:0}}>
                <Icon name="share" size={20}/>
              </div>
            </BrutalShadow>
          </div>
        </div>
      </>
    );
  }
  function BrutalExpandCard({ body, defaultOpen }: { body: string; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(!!defaultOpen);
    return (
      <>
        {/* Smooth expand */}
        <div style={{
          display:"grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition:"grid-template-rows 350ms cubic-bezier(0.4,0,0.2,1)",
          overflow:"hidden",
          borderBottom: open ? "1px solid #000" : "none",
          boxSizing:"border-box",
        }}>
          <div style={{overflow:"hidden"}}>
            {body.split("\n\n").filter(p => p.trim()).map((para, i) => (
              <p key={i} style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.8,color:"#000",margin:"0 0 12px"}}>
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
        {/* Toggle CTA — replaces the static LEARN MORE below when rendered */}
        <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
          <div style={{flex:1,overflow:"visible"}}>
            <BrutalShadow block>
              <div className="bc-cta" onClick={()=>setOpen(o=>!o)} style={{cursor:"pointer"}}>
                <span>{open ? "CLOSE" : "LEARN MORE"}</span>
                <span style={{transform: open ? "rotate(-90deg)" : "rotate(0deg)", display:"inline-block", transition:"transform 200ms ease"}}>
                  <ArrowRight size={20}/>
                </span>
              </div>
            </BrutalShadow>
          </div>
          <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
            <BrutalShadow block>
              <div className="bc-cta" style={{justifyContent:"center",padding:0}}>
                <Icon name="share" size={20}/>
              </div>
            </BrutalShadow>
          </div>
        </div>
      </>
    );
  }

  function BrutalFaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="bc-cta-wrap" style={{marginTop:0, marginBottom:-1}}>
        <BrutalShadow block>
          <div onClick={()=>setOpen(o=>!o)} className="bc-cta"
            style={{cursor:"pointer", height:"auto", minHeight:64, alignItems:"center", gap:12,
              background: open ? "#fff" : "#FFCE00"}}>
            <div style={{flex:1, display:"flex", flexDirection:"column", justifyContent:"center",
              padding: open ? "12px 0 16px" : "0", gap:4,
              transition:"padding 250ms ease"}}>
              <span style={{fontWeight:400}}>{q}</span>
              {/* Grid rows trick — smooth height without touching BrutalShadow transform */}
              <div style={{
                display:"grid",
                gridTemplateRows: open ? "1fr" : "0fr",
                transition:"grid-template-rows 250ms ease",
                overflow:"hidden",
              }}>
                <div style={{overflow:"hidden"}}>
                  <span style={{fontSize:15, fontWeight:300, lineHeight:1.6, display:"block"}}>{a}</span>
                </div>
              </div>
            </div>
            <span style={{transform: open ? "rotate(-90deg)" : "rotate(90deg)", display:"inline-block", flexShrink:0, transition:"transform 200ms ease"}}>
              <ArrowRight size={20}/>
            </span>
          </div>
        </BrutalShadow>
      </div>
    );
  }

  function LearnMoreCta({ onLearnMore }: { onLearnMore?: () => void }) {
    return <>
      <div style={{flex:1,overflow:"visible"}}>
        <BrutalShadow block>
          <div className="bc-cta" onClick={onLearnMore} style={{cursor:onLearnMore?"pointer":"default"}}>
            <span>LEARN MORE</span><ArrowRight size={20}/>
          </div>
        </BrutalShadow>
      </div>
      <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
        <BrutalShadow block>
          <div className="bc-cta" style={{justifyContent:"center",padding:0}}>
            <Icon name="share" size={20}/>
          </div>
        </BrutalShadow>
      </div>
    </>;
  }

  return (
    <div style={{fontFamily:font}}>
      {/* Single outer bc-row — all about content lives between these strips */}
      <div className="bc-row">
        <div className="bc-strip-l"/>
        <div className="bc-col">

          {/* 1. Top margin spacer */}
          <div className="bc-spacer"/>

          {/* 2. Done — shadow flush bottom+right, face bleeds 16px up into spacer */}
          <div style={{height:56,borderBottom:"1px solid #000",boxSizing:"border-box",display:"flex",justifyContent:"flex-end",alignItems:"flex-end",overflow:"visible",flexShrink:0,marginTop:-16}}>
            <div style={{marginBottom:16,marginRight:16,overflow:"visible",flexShrink:0}}>
              <BrutalShadow>
                <button onClick={onClose} style={{height:40,padding:"0 16px",background:"#fff",border:"1px solid #000",fontFamily:font,fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center"}}>
                  Done
                </button>
              </BrutalShadow>
            </div>
          </div>

          {/* 3. Spacer before title block */}
          <div className="bc-spacer"/>

          {/* ABOUT eyebrow + title + body (left col) side by side with photo (right col) */}
          <div style={{display:"flex",alignItems:"stretch",borderBottom:"1px solid #000",boxSizing:"border-box"}}>
            {/* Left column — fills width, each item has its own border-bottom */}
            <div style={{flex:1,display:"flex",flexDirection:"column"}}>
              <div className="bc-eyebrow">ABOUT</div>
              <div style={{fontFamily:font,fontWeight:700,fontSize:30,lineHeight:1.2,color:"#000",borderBottom:"1px solid #000",boxSizing:"border-box"}}>
                0→1 Product Technologist — USA
              </div>
              <div style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6,color:"#000",flex:1,display:"flex",alignItems:"center"}}>
                Learn more about the site&apos;s author below!
              </div>
            </div>
            {/* Right column — fixed 100px photo, no top/right border (adjacent strokes) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/About/mishasky.jpeg" alt="Misha Sky"
              style={{width:100,height:100,objectFit:"cover",flexShrink:0,display:"block",
                borderLeft:"1px solid #000", borderTop:"none", borderRight:"none", borderBottom:"none"}}/>
          </div>

          {/* 32px spacer between header block and cards */}
          <div className="bc-spacer"/>

          {/* ── RPG card ── */}
          <div style={{borderBottom:"1px solid #000", boxSizing:"border-box", background:"#889D58"}}>
            <div className="bc-row">
              <div className="bc-strip-l"/>
              <div className="bc-col">
                <div className="bc-eyebrow">POP CULTURE</div>
                <div className="bc-title" style={{textTransform:"none",fontWeight:700}}>Why a quiz game about role fit?</div>
                <div style={{fontFamily:font,fontWeight:300,fontSize:15,color:"#000",padding:"8px 0 16px",lineHeight:1.6,borderBottom:"1px solid #000",boxSizing:"border-box"}}>
                  Helping hire right. (Even if it&apos;s not me.)
                </div>
                <div style={{flex:1,borderBottom:"1px solid #000",boxSizing:"border-box"}}/>
                {/* CTAs + expandable content */}
                <BrutalRpgExpand defaultOpen={initialOpenId === "rpg"}/>
                <div className="bc-spacer-last"/>
              </div>
              <div className="bc-strip-r"/>
            </div>
          </div>

          {/* 32px gap between cards */}
          <div className="bc-spacer"/>

          {/* ── ABOUT_CARDS (skip rpg — already rendered as green card) ── */}
          {ABOUT_CARDS.filter(c => c.id !== "rpg").map((card, i) => (
            <>
              {i > 0 && <div className="bc-spacer"/>}
              <div key={card.id} id={`brutal-about-card-${card.id}`} style={{borderBottom:"1px solid #000",boxSizing:"border-box"}}>
              <div className="bc-row">
                <div className="bc-strip-l"/>
                <div className="bc-col">
                  <div className="bc-spacer"/>
                  <div className="bc-eyebrow">{card.eyebrow}</div>
                  <div className="bc-title">{card.title}</div>
                  {card.body && (
                    <div style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6,color:"#000",padding:"16px 0",borderBottom:"1px solid #000",boxSizing:"border-box"}}>
                      {card.body}
                    </div>
                  )}
                  {/* Expanded body — grid-rows smooth height, LEARN MORE toggles */}
                  {card.id === "who" && card.expandedBody && (
                    <BrutalExpandCard body={card.expandedBody} defaultOpen={initialOpenId === "who"}/>
                  )}
                  {card.id !== "who" && (
                    <BrutalArticleExpand card={card} defaultOpen={initialOpenId === card.id}/>
                  )}
                  <div className="bc-spacer-last"/>
                </div>
                <div className="bc-strip-r"/>
              </div>
            </div>
            </>
          ))}

          {/* ── RESUME ── */}
          <div className="bc-spacer"/>
          <div style={{borderBottom:"1px solid #000",boxSizing:"border-box"}}>
            <div className="bc-row">
              <div className="bc-strip-l"/>
              <div className="bc-col">
                <div className="bc-spacer"/>
                <div className="bc-eyebrow">RESUME</div>
                <div className="bc-title">Amazon | Neon Machine | Expedia | Walmart | Funko | Deloitte | Microsoft | +</div>
                <div style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6,color:"#000",padding:"16px 0",borderBottom:"1px solid #000",boxSizing:"border-box"}}>
                  10+ Years of momentum, strategy, and empathy. UX + Visual + Motion + IDE.
                </div>
                <div style={{flex:1,borderBottom:"1px solid #000",boxSizing:"border-box"}}/>
                <BrutalResumeCard/>
                <div className="bc-spacer-last"/>
              </div>
              <div className="bc-strip-r"/>
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="bc-spacer"/>
          <div style={{borderBottom:"1px solid #000",boxSizing:"border-box"}}>
            <div className="bc-row">
              <div className="bc-strip-l"/>
              <div className="bc-col">
                <div className="bc-spacer"/>
                <div className="bc-eyebrow">FAQ</div>
                {/* No bc-title border-bottom — first pill provides the line */}
                <div style={{fontFamily:font,fontWeight:700,fontSize:30,lineHeight:1.3,boxSizing:"border-box" as const,textTransform:"uppercase" as const}}>Frequently Asked Questions</div>
                {FAQ_ITEMS.map((item, i) => (
                  <BrutalFaqItem key={i} q={item.q} a={item.a}/>
                ))}
                <div className="bc-spacer-last"/>
              </div>
              <div className="bc-strip-r"/>
            </div>
          </div>

          {/* ── CHAT ── */}
          <div style={{borderBottom:"1px solid #000",boxSizing:"border-box"}}>
            <div className="bc-row">
              <div className="bc-strip-l"/>
              <div className="bc-col">
                <div className="bc-spacer"/>
                <div className="bc-eyebrow">POWERED BY CLAUDE AI</div>
                <div className="bc-title">WWMD. What Would Misha Do (or say)?</div>
                <div style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6,color:"#000",padding:"16px 0",borderBottom:"1px solid #000",boxSizing:"border-box"}}>
                  From Nirvana to the function of design. Ask anything.
                </div>
                <div style={{flex:1,borderBottom:"1px solid #000",boxSizing:"border-box"}}/>
                <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
                  <div style={{flex:1,overflow:"visible"}}>
                    <BrutalShadow block>
                      <div className="bc-cta" style={{background:"#fff"}}>
                        <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                          placeholder="Ask anything..."
                          style={{flex:1,border:"none",outline:"none",fontFamily:font,fontSize:15,fontWeight:300,background:"transparent",color:"#000",width:"100%"}}
                        />
                      </div>
                    </BrutalShadow>
                  </div>
                  <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
                    <BrutalShadow block>
                      <div className="bc-cta" onClick={()=>{onClose();openChat();}} style={{justifyContent:"center",padding:0,cursor:"pointer"}}>
                        <ArrowRight size={20}/>
                      </div>
                    </BrutalShadow>
                  </div>
                </div>
                <div className="bc-spacer-last"/>
              </div>
              <div className="bc-strip-r"/>
            </div>
          </div>

          <div className="bc-spacer-last"/>
        </div>
        <div className="bc-strip-r"/>
      </div>
    </div>
  );
}

function AboutSection({ onClose, openChat, initialOpenId }: { onClose: () => void; openChat: () => void; initialOpenId?: string }) {
  return (
    <div style={{ fontFamily:'"T-Star Mono",monospace', padding:"32px 32px 48px", position:"relative" }}>
      {/* Close button — top right of card */}
      <button
        onClick={onClose}
        aria-label="Close about"
        className="proj-close-btn"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/>
        </svg>
      </button>

      {/* Header */}
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32}}>
        <div style={{flex:1, paddingRight:32}}>
          <div style={{
            fontSize:12, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase",
            color:"#888", borderBottom:"1px solid var(--border)", paddingBottom:6,
            display:"inline-block", marginBottom:12,
          }}>
            ABOUT
          </div>
          <h1 style={{fontSize:30, fontWeight:500, lineHeight:1.2, margin:"0 0 8px", color:"#111", fontFamily:'"T-Star Mono",monospace'}}>
            0→1 Product Technologist — USA
          </h1>
          <p style={{fontSize:15, fontWeight:300, color:"#555", margin:0, lineHeight:1.6, fontFamily:'"T-Star Mono",monospace'}}>
            Learn more about the site&apos;s author below!
          </p>
        </div>

        {/* Photo — fixed size matching text block height */}
        <div style={{flexShrink:0, width:100, height:100}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/About/mishasky.jpeg"
            alt="Misha Sky"
            style={{width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover", display:"block"}}
          />
        </div>
      </div>

      {/* Cards */}
      {ABOUT_CARDS.map(card => (
        <AboutCard
          key={card.id}
          card={card}
          defaultOpen={card.id === initialOpenId}
          onPlay={card.id === "rpg" ? () => { window.scrollTo({top:0,behavior:"smooth"}); openChat(); } : undefined}
        />
      ))}

      {/* Resume card */}
      <ResumeInlineCard/>

      {/* FAQ */}
      <FaqSection openChat={openChat}/>
    </div>
  );
}

// ── BrutalChatSection — bc-row styled chat with live API ─────────────────────
function BrutalChatSection({ onClose, extMessages, setExtMessages, extLoading, setExtLoading, initialQ }: {
  onClose: () => void;
  extMessages?: {q:string;a:string}[];
  setExtMessages?: React.Dispatch<React.SetStateAction<{q:string;a:string}[]>>;
  extLoading?: boolean;
  setExtLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  initialQ?: string;
}) {
  const font = '"T-Star Mono",monospace';
  const [chatInput, setChatInput] = useState("");
  const [intMessages, setIntMessages] = useState<{q:string;a:string}[]>([]);
  const [intLoading, setIntLoading] = useState(false);
  const messages   = extMessages   ?? intMessages;
  const setMessages= setExtMessages ?? setIntMessages;
  const loading    = extLoading    ?? intLoading;
  const setLoading = setExtLoading ?? setIntLoading;
  const initialQFired = useRef(false);

  // Auto-submit initial question from home card
  useEffect(() => {
    if (!initialQ || initialQFired.current) return;
    initialQFired.current = true;
    const q = initialQ;
    setLoading(true);
    fetch("/api/chat", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({question:q}) })
      .then(r=>r.json())
      .then(data => { setMessages(m=>[...m,{q,a:data.response??data.error??"Something went wrong."}]); setLoading(false); })
      .catch(() => { setMessages(m=>[...m,{q,a:"Something went wrong. Try again."}]); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit() {
    const q = chatInput.trim();
    if (!q || loading) return;
    setChatInput("");
    setLoading(true);
    fetch("/api/chat", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({question:q}),
    })
      .then(r=>r.json())
      .then(data=>{
        setMessages(m=>[...m,{q, a:data.response??data.error??"Something went wrong."}]);
        setLoading(false);
      })
      .catch(()=>{
        setMessages(m=>[...m,{q, a:"Something went wrong. Try again."}]);
        setLoading(false);
      });
  }

  return (
    <div style={{fontFamily:font, background:"#f3f3f7"}}>
      <div className="bc-row">
        <div className="bc-strip-l"/>
        <div className="bc-col">
          <div className="bc-spacer"/>
          {/* Done button */}
          <div style={{height:56,borderBottom:"1px solid #000",display:"flex",justifyContent:"flex-end",alignItems:"flex-end",marginTop:-16}}>
            <div style={{marginBottom:16,marginRight:16}}>
              <BrutalShadow>
                <button onClick={onClose} style={{fontFamily:font,fontSize:16,fontWeight:700,background:"#FFD000",border:"1px solid #000",padding:"0 24px",height:40,cursor:"pointer",display:"flex",alignItems:"center"}}>
                  Done
                </button>
              </BrutalShadow>
            </div>
          </div>
          <div className="bc-spacer"/>
          {/* Header */}
          <div style={{borderBottom:"1px solid #000"}}>
            <div className="bc-eyebrow">POWERED BY CLAUDE AI</div>
            <div className="bc-title">WWMD. What Would Misha Do (or say)?</div>
            <div style={{borderBottom:"1px solid #000",fontSize:14,fontWeight:300,lineHeight:1.5,padding:"8px 0",fontFamily:font}}>
              From Nirvana to the function of design. Ask anything.
            </div>
          </div>
          <div className="bc-spacer"/>
          {/* Messages */}
          {(messages.length > 0 || loading) && (
            <div style={{borderBottom:"1px solid #000",boxSizing:"border-box",display:"flex",flexDirection:"column",gap:12,padding:"16px 0"}}>
              {messages.map((m,i) => (
                <div key={i} style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{background:"#1B6EF3",color:"#fff",fontFamily:font,fontWeight:700,fontSize:15,padding:"8px 16px",alignSelf:"flex-start"}}>{m.q}</div>
                  <div style={{fontFamily:font,fontWeight:300,fontSize:15,lineHeight:1.6,color:"#000"}}>{m.a}</div>
                </div>
              ))}
              {loading && <div style={{fontFamily:font,fontWeight:300,fontSize:15,color:"#888"}}>···</div>}
            </div>
          )}
          {/* Input */}
          <div className="bc-cta-wrap" style={{display:"flex",gap:0}}>
            <div style={{flex:1,overflow:"visible"}}>
              <BrutalShadow block>
                <div className="bc-cta" style={{background:"#fff"}}>
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                    placeholder="Ask anything..."
                    style={{flex:1,border:"none",outline:"none",fontFamily:font,fontSize:15,fontWeight:300,background:"transparent",color:"#000",width:"100%"}}
                  />
                </div>
              </BrutalShadow>
            </div>
            <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
              <BrutalShadow block>
                <div className="bc-cta" onClick={handleSubmit} style={{justifyContent:"center",padding:0,cursor:"pointer"}}>
                  <ArrowRight size={20}/>
                </div>
              </BrutalShadow>
            </div>
          </div>
          <div className="bc-spacer-last"/>
        </div>
        <div className="bc-strip-r"/>
      </div>
    </div>
  );
}

// ── ChatSection — same header as About, just the AI chat ─────────────────────
function ChatSection({ onClose, extMessages, setExtMessages, extLoading, setExtLoading, initialQ, compact }: {
  onClose: () => void;
  extMessages?: {q:string;a:string}[];
  setExtMessages?: React.Dispatch<React.SetStateAction<{q:string;a:string}[]>>;
  extLoading?: boolean;
  setExtLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  initialQ?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div style={{ fontFamily:'"T-Star Mono",monospace', padding:"20px 20px 28px", position:"relative" }}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <span style={{fontSize:11,fontWeight:500,letterSpacing:"0.14em",textTransform:"uppercase" as const,color:"#888"}}>WWMD — AI Chat</span>
          <button onClick={onClose} aria-label="Close chat" style={{background:"none",border:"none",cursor:"pointer",padding:4,color:"#555",lineHeight:1}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/></svg>
          </button>
        </div>
        <AboutChat extMessages={extMessages} setExtMessages={setExtMessages} extLoading={extLoading} setExtLoading={setExtLoading} initialQ={initialQ}/>
      </div>
    );
  }
  return (
    <div style={{ fontFamily:'"T-Star Mono",monospace', padding:"32px 32px 48px", position:"relative" }}>
      {/* Close button */}
      <button onClick={onClose} aria-label="Close chat" className="proj-close-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/>
        </svg>
      </button>

      {/* Header */}
      <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:32}}>
        <div style={{flex:1, paddingRight:32}}>
          <div style={{
            fontSize:12, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase",
            color:"#888", borderBottom:"1px solid var(--border)", paddingBottom:6,
            display:"inline-block", marginBottom:12,
          }}>
            POWERED BY CLAUDE AI
          </div>
          <h1 style={{fontSize:30, fontWeight:500, lineHeight:1.2, margin:"0 0 8px", color:"#111", fontFamily:'"T-Star Mono",monospace'}}>
            WWMD. What Would Misha Do (or say)?
          </h1>
          <p style={{fontSize:15, fontWeight:300, color:"#555", margin:0, lineHeight:1.6, fontFamily:'"T-Star Mono",monospace'}}>
            From Nirvana to the function of design. Ask anything.
          </p>
        </div>
        {/* Photo */}
        <div style={{flexShrink:0, width:100, height:100}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/About/mishasky.jpeg" alt="Misha Sky"
            style={{width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover", display:"block"}}
          />
        </div>
      </div>

      {/* Chat */}
      <AboutChat extMessages={extMessages} setExtMessages={setExtMessages} extLoading={extLoading} setExtLoading={setExtLoading} initialQ={initialQ}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function SiteShell({ initialSlug }: { initialSlug?: string } = {}) {
  const [mode, setMode]     = useState<Mode>("home");
  const [theme, setTheme]   = useState<Theme>("default");
  const [locale, setLocale] = useState<"en" | "ja">("en");

  // ── Wordmark fixed-layer refs ─────────────────────────────────────────────
  const wordmarkRef         = useRef<WordmarkFixedHandle>(null);
  const placeholderRef      = useRef<HTMLDivElement>(null);
  const [brutalJustEntered, setBrutalJustEntered] = useState(false);
  const [depressing, setDepressing] = useState(false);
  const BRUTAL_DUR = 150; // ms — matches BrutalShadow

  function toggleLocale() { setLocale(l => l === "en" ? "ja" : "en"); }

  // Localised string lookup — falls back to English key if JA missing
  function t(enStr: string, jaKey: keyof typeof JA): string {
    return locale === "ja" ? (JA[jaKey] ?? enStr) : enStr;
  }

  function handleFreeformSubmit() {
    if (!freeformInput.trim() || !endState) return;
    const response = generateResponse(freeformInput, {
      tags, endState, character, fitScore,
    });
    setFreeformResponse(response);
    setFreeformInput("");
  }
  function localizedBody(t_tags: AnswerTag[], es: EndState): string {
    if (locale !== "ja") return summarizePath(t_tags, es);
    const keyMap: Partial<Record<EndState, keyof typeof JA>> = {
      win:               "body_win",
      soft:              "body_soft",
      borderline:        "body_borderline",
      "kill-pricing":    "body_kill_pricing",
      "kill-contradiction": "body_kill_contra",
      "kill-techfirst":  "body_kill_tech",
      "kill-authority":  "body_kill_authority",
    };
    const key = keyMap[es];
    return key ? (JA[key] ?? summarizePath(t_tags, es)) : summarizePath(t_tags, es);
  }

  // Project overlay
  const [projectSlug, setProjectSlug] = useState<string | null>(initialSlug ?? null);
  const [projectClosing, setProjectClosing] = useState(false);
  const [aboutClosing, setAboutClosing] = useState(false);
  const [aboutInitialCard, setAboutInitialCard] = useState<string | undefined>(undefined);
  const [aiChatClosing, setAiChatClosing] = useState(false);
  const [homeAiChatInput, setHomeAiChatInput] = useState("");
  const [brutalHomeAiChatInput, setBrutalHomeAiChatInput] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<{q:string;a:string}[]>([]);
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [aiChatInitialQ, setAiChatInitialQ] = useState<string | undefined>(undefined);
  const [workClosing,  setWorkClosing]  = useState(false);

  // Chat state
  const [phase, setPhase]         = useState<ChatPhase>("question");
  const [step, setStep]           = useState(0);
  const [selected, setSelected]   = useState<0|1|2|null>(null);
  const [quip, setQuip]           = useState<string | null>(null);
  const [tags, setTags]           = useState<AnswerTag[]>([]);
  const [fitScore, setFitScore]   = useState(0);
  const [character, setCharacter] = useState<CharacterTag>("default");
  const [endState, setEndState]   = useState<EndState | null>(null);
  const [killNode, setKillNode]   = useState<string | null>(null);
  // path history: [{nodeKey, choiceIdx}] for tree reveal
  const [pathHistory, setPathHistory] = useState<{nodeKey:string; choiceIdx:number}[]>([]);
  const [showFreeform, setShowFreeform] = useState(false);
  const [isMobile, setIsMobile]         = useState(false);
  const [showWinOptions, setShowWinOptions] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  // Restore MISHA wordmark whenever leaving chat mode through any path
  // (e.g. clicking Projects from the post-quiz card grid bypasses closeChat)
  const prevModeRef = useRef<string>(mode);
  useEffect(() => {
    const was = prevModeRef.current;
    prevModeRef.current = mode;
    if (was === "chat" && mode !== "chat") {
      setShowWinOptions(false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        wordmarkRef.current?.jumpIn();
      }));
    }
  }, [mode]);
  const [freeformInput, setFreeformInput] = useState("");
  const [freeformResponse, setFreeformResponse] = useState<string | null>(null);
  const [treeKey, setTreeKey]           = useState(0);
  const [warned, setWarned]             = useState(false);  // true after first bad answer
  const [warnBlink, setWarnBlink]       = useState(false);  // drives warning icon pulse
  const [showQuip, setShowQuip]   = useState(false);
  const [chatKey, setChatKey]     = useState(0);

  function cycleTheme() {
    const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length];
    if (wordmarkRef.current) {
      wordmarkRef.current.jump();
      if (nextTheme === "brutalist") {
        setTimeout(() => {
          setBrutalJustEntered(true);
          setTheme(nextTheme);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setDepressing(true);
              setBrutalJustEntered(false); // pill starts raising
              setTimeout(() => {
                wordmarkRef.current?.syncPos();
                setDepressing(false);
              }, BRUTAL_DUR + 30);
            });
          });
        }, TOTAL_JUMP_MS);
      } else {
        // All other themes: flip mid-air at peak
        setTimeout(() => setTheme(nextTheme), THEME_FLIP_DELAY);
      }
    } else {
      if (nextTheme === "brutalist") setBrutalJustEntered(true);
      setTheme(nextTheme);
    }
  }

  function openProject(slug: string) {
    setProjectSlug(slug);
    setProjectClosing(false);
    window.history.pushState(null, "", `/${slug}`);
  }

  function closeProject() {
    setProjectClosing(true);
    setTimeout(() => {
      setProjectSlug(null);
      setProjectClosing(false);
      window.history.pushState(null, "", "/");
    }, T["1x"]);
  }

  // Lock body scroll when project overlay is open — prevents double scrollbar
  // Reset any pre-opened about card whenever we leave the about view
  useEffect(() => {
    if (mode !== "about") setAboutInitialCard(undefined);
  }, [mode]);

  useEffect(() => {
    if (projectSlug) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [projectSlug]);

  function closeAbout() {
    setAboutClosing(true);
    setTimeout(() => {
      setMode("home");
      setAboutClosing(false);
      setAboutInitialCard(undefined);
    }, T["1x"]);
  }

  function closeAiChat() {
    setAiChatClosing(true);
    setAiChatInitialQ(undefined);
    setTimeout(() => {
      setMode("home");
      setAiChatClosing(false);
    }, T["1x"]);
  }

  function closeWork() {
    setWorkClosing(true);
    setTimeout(() => {
      setMode("home");
      setWorkClosing(false);
    }, T["1x"]);
  }

  function selectTheme(t: Theme) {
    if (t === theme) return;
    if (wordmarkRef.current) {
      wordmarkRef.current.jump();
      if (t === "brutalist") {
        setTimeout(() => {
          setBrutalJustEntered(true);
          setTheme(t);
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setDepressing(true);
              setBrutalJustEntered(false);
              setTimeout(() => {
                wordmarkRef.current?.syncPos();
                setDepressing(false);
              }, BRUTAL_DUR + 30);
            });
          });
        }, TOTAL_JUMP_MS);
      } else {
        setTimeout(() => setTheme(t), THEME_FLIP_DELAY);
      }
    } else {
      if (t === "brutalist") setBrutalJustEntered(true);
      setTheme(t);
    }
  }

  function openChat() {
    setShowWinOptions(false);
    // Letters hop out, then chat opens
    wordmarkRef.current?.jumpOut().then(() => {
      setChatKey(k => k + 1);
      setPhase("question"); setStep(0); setSelected(null);
      setQuip(null); setShowQuip(false); setTags([]); setFitScore(0);
      setCharacter("default");
      setEndState(null); setKillNode(null); setPathHistory([]);
      setShowFreeform(false); setWarned(false); setWarnBlink(false);
      setFreeformInput(""); setFreeformResponse(null);
      setMode("chat");
    });
    if (!wordmarkRef.current) {
      setChatKey(k => k + 1);
      setPhase("question"); setStep(0); setSelected(null);
      setQuip(null); setShowQuip(false); setTags([]); setFitScore(0);
      setCharacter("default");
      setEndState(null); setKillNode(null); setPathHistory([]);
      setShowFreeform(false); setWarned(false); setWarnBlink(false);
      setFreeformInput(""); setFreeformResponse(null);
      setMode("chat");
    }
  }

  function closeChat() {
    setMode("home");
    // Letters descend back in after home re-renders (placeholder re-mounts)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wordmarkRef.current?.jumpIn();
    }));
  }

  function selectOption(i: 0|1|2) { setSelected(i); }

  function confirmSelection() {
    if (selected === null) return;
    const q = QUESTIONS[step];
    const ans = q.answers[selected];
    const newTags = ans.tag ? [...tags, ans.tag] : tags;
    const newFit  = fitScore + ans.fit;
    const newStep = step + 1;

    // Track N0 character tag
    if (step === 0 && ans.tag) {
      const charMap: Record<string, CharacterTag> = { hero:"hero", servant:"servant", seeker:"seeker" };
      setCharacter(charMap[ans.tag] ?? "default");
    }

    setTags(newTags);
    setFitScore(newFit);
    setPathHistory(prev => [...prev, { nodeKey: q.nodeKey, choiceIdx: selected }]);
    const quipEn = q.quips[selected];
    const quipKey = `quip_${q.nodeKey}_${String.fromCharCode(65+selected)}` as keyof typeof JA;
    const quipKeyGeneric = `quip_${q.nodeKey}` as keyof typeof JA;
    const localizedQuip = locale === "ja"
      ? (JA[quipKey] ?? JA[quipKeyGeneric] ?? quipEn)
      : quipEn;
    setQuip(localizedQuip);
    setShowQuip(false);
    setPhase("processing");

    const isBadAnswer = ans.fit <= -2;

    // First bad answer → warn. Second bad answer while warned → immediate loss.
    if (isBadAnswer && warned) {
      // Immediate loss — resolve end state now, skip remaining questions
      const es = resolveEndState(newTags, newFit);
      const kn = resolveKillNode(es, newTags);
      const quipDelay = setTimeout(() => setShowQuip(true), 800);
      const processingDelay = Math.max(2400, 850 + quipEn.length * 30 + 1000);
      setTimeout(() => {
        clearTimeout(quipDelay);
        setEndState(es !== "win" && es !== "soft" && es !== "borderline" ? es : "soft");
        setKillNode(kn ?? q.nodeKey);
        setWarnBlink(false);
        setPhase("done");
      }, processingDelay);
      return;
    }

    if (isBadAnswer && !warned) {
      setWarned(true);
      setWarnBlink(true);
      // warnBlink persists until next question phase starts
    }

    const quipDelay = setTimeout(() => setShowQuip(true), 800);
    const processingDelay = Math.max(2400, 850 + quipEn.length * 30 + 1000);

    setTimeout(() => {
      clearTimeout(quipDelay);
      if (newStep >= QUESTIONS.length) {
        const es = resolveEndState(newTags, newFit);
        const kn = resolveKillNode(es, newTags);
        setEndState(es);
        setKillNode(kn);
        setPhase("done");
      } else {
        setStep(newStep);
        setSelected(null);
        setQuip(null);
        setShowQuip(false);
        setPhase("question");
      }
    }, processingDelay);
  }

  const isBrutalist = theme === "brutalist";
  const isGameboy   = theme === "gameboy";
  const R       = isBrutalist ? "0px" : "32px";
  const shadow  = "4px 4px 16px rgba(0,0,0,0.20)";
  const wborder = "1px solid rgba(255,255,255,0.9)";
  const isChat  = mode === "chat";

  // Card background color based on state
  const cardBg = (() => {
    if (endState === "win")              return "#FFD000";
    if (endState?.startsWith("kill"))    return "#1a0a0a";
    if (endState === "soft")             return "#1B6EF3";
    if (endState === "borderline")       return "#1B6EF3";
    return "#1B6EF3";
  })();
  const cardColor = endState === "win" ? "#111" : "#fff";

  const currentQ   = QUESTIONS[step];
  const isBinaryQ  = !!currentQ?.binary;

  // Binary node icons inline (check, close, ≠)
  const BINARY_ICONS = [
    <span key="y"   style={{fontSize:30,fontWeight:500,lineHeight:1,fontFamily:'"T-Star Mono",monospace'}}>Y</span>,
    <span key="n"   style={{fontSize:30,fontWeight:500,lineHeight:1,fontFamily:'"T-Star Mono",monospace'}}>N</span>,
    <span key="neq" style={{fontSize:30,fontWeight:300,lineHeight:1,fontFamily:'"T-Star Mono",monospace'}}>≠</span>,
  ];

  // Typewriter — resets on each new step
  const qKey = currentQ?.nodeKey as keyof typeof JA | undefined;
  const qText = currentQ
    ? (locale === "ja" ? (JA[`q_${currentQ.nodeKey}` as keyof typeof JA] ?? currentQ.text) : currentQ.text)
    : "";
  const twLines = currentQ
    ? [qText + " ", ...currentQ.answers.map((a, i) => {
        const aKey = `a_${currentQ.nodeKey}_${String.fromCharCode(65+i)}` as keyof typeof JA;
        const aText = locale === "ja" ? (JA[aKey] ?? a.text) : a.text;
        return `${String.fromCharCode(65+i)}. ${aText} `;
      })]
    : [];
  const { typed: twTyped, done: twDone } = useTypewriter(twLines, phase === "question", chatKey * 100 + step);

  // Cross-reference text
  const crossRefText = currentQ?.crossRef?.condition(tags, fitScore)
    ? currentQ.crossRef.text
    : null;

  return (
    <div style={{ background: isGameboy ? "#E8E4DF" : "#fff", color:"#111", minHeight:"100vh", fontFamily:'"T-Star Mono",monospace' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{max-width:100%;overflow-x:hidden}
        .w{max-width:1220px;margin:0 auto;width:100%;padding:0 36px}

        /* ── HEADER ── */
        .hdr{padding:36px 0 0}
        .hdr.off{display:none}
        .pill{
          display:flex;align-items:center;justify-content:center;
          background:#1B6EF3;border:none;border-radius:${R};
          padding:.85rem 2rem;cursor:pointer;min-height:60px;width:100%;
          position:relative;
        }
        .pill:hover{opacity:.92}
        .nav-row{display:flex;flex-direction:column;align-items:flex-start;gap:16px;margin-top:32px}
        @media(min-width:500px){.nav-row{flex-direction:row;align-items:center;justify-content:space-between}}
        .nav-btns{display:flex;align-items:center;justify-content:space-between;width:100%;gap:0}
        @media(min-width:500px){
          .nav-btns{width:auto;gap:12px;justify-content:flex-start}
        }
        .powered-wrap{display:flex}
        @media(min-width:500px){.powered-wrap{display:flex}}
        .nav-btn{
          width:56px;height:56px;border-radius:50%;border:${wborder};
          background:#FFD000;color:#111;cursor:pointer;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;box-shadow:${shadow};
          font-family:"T-Star Mono",monospace;font-size:16px;font-weight:500;
          transition:background .12s,color .12s;
        }
        .nav-btn:hover,.nav-btn.on{background:#1B6EF3;color:#fff}
        .powered{
          font-size:16px;font-weight:300;letter-spacing:.04em;
          color:#1B6EF3;background:#f3f3f7;border-radius:999px;
          padding:0 1.25rem;font-family:"T-Star Mono",monospace;
          white-space:nowrap;display:inline-flex;align-items:center;
          height:56px;flex-shrink:0;
        }

        /* ── CHAT CARD ── */
        .chat-outer{padding:36px 0 0}
        .chat-card{
          border-radius:${R};position:relative;
          height:420px;padding:28px 36px 36px;
          display:flex;flex-direction:column;justify-content:flex-end;
          color:#fff;overflow:hidden;
          animation:chatGrow .35s cubic-bezier(.4,0,.2,1) both;
          transition:background 0.6s ease, box-shadow 0.3s ease;
        }
        @keyframes chatGrow{from{height:60px}to{height:420px}}
        .chat-card.red-pulse{
          position:relative;
        }
        /* Red overlay layer — heartbeat: fast in (1x=200ms), slow out (3x=600ms) */
        .chat-card.red-pulse::before{
          content:"";
          position:absolute;inset:0;
          background:#dc2626;
          border-radius:inherit;
          pointer-events:none;
          z-index:0;
          animation:heartbeat 800ms cubic-bezier(0.5,0,0.85,1) infinite;
        }
        /* Ensure card content sits above the red layer */
        .chat-card.red-pulse .chat-body,
        /* Ensure card content sits above the red layer */
        .chat-card.red-pulse .chat-body{position:relative;z-index:1}
        .chat-card.red-pulse .chat-close{z-index:3}
        @keyframes heartbeat{
          0%   { opacity:0; }
          25%  { opacity:1; }
          100% { opacity:0; }
        }
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes tube-flicker{
          0%   { opacity:0.2; }
          5%   { opacity:0.9; }
          10%  { opacity:0.3; }
          12%  { opacity:1.0; }
          15%  { opacity:0.1; }
          20%  { opacity:1.0; }
          25%  { opacity:0.9; }
          30%  { opacity:1.0; }
          70%  { opacity:0.9; }
          72%  { opacity:0.2; }
          75%  { opacity:0.9; }
          100% { opacity:1.0; }
        }
        @keyframes node-stroke-draw{
          from { stroke-dashoffset: 160; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes node-conn-draw{
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes node-fill-in{
          0%   { opacity:0; }
          5%   { opacity:0.9; }
          10%  { opacity:0.3; }
          12%  { opacity:1.0; }
          15%  { opacity:0.1; }
          20%  { opacity:1.0; }
          25%  { opacity:0.9; }
          30%  { opacity:1.0; }
          100% { opacity:1.0; }
        }
        @keyframes node-stroke-on{
          from { opacity:0.2; }
          to   { opacity:1.0; }
        }
        @keyframes clip-wipe{
          from { width:0; }
          to   { width:200px; }
        }
        @keyframes clip-wipe-scale{
          from { transform:scaleX(0); }
          to   { transform:scaleX(1); }
        }
        @keyframes clip-wipe-vert{
          from { transform:scaleY(0); }
          to   { transform:scaleY(1); }
        }
        .chat-close{
          position:absolute;top:20px;right:20px;
          width:40px;height:40px;border-radius:50%;
          background:#fff;border:none;color:#1B6EF3;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;z-index:2;
          animation:fadeIn .2s ease .2s both;
        }
        .chat-close:hover{background:rgba(255,255,255,.85)}
        .chat-body{display:flex;flex-direction:column;height:100%;animation:fadeIn .25s ease .25s both}
        /* ·: static — always shown during processing, hidden otherwise */
        .chat-indicator{
          min-height:36px;display:flex;align-items:center;gap:8px;
          font-family:monospace;font-size:18px;
          color:rgba(255,255,255,0.5);
          visibility:hidden;margin-bottom:8px;
        }
        .chat-indicator.active{visibility:visible}
        /* freeform input row — shown during processing instead of A/B/C */
        .chat-input-row{
          margin:16px 0 0;display:flex;align-items:center;gap:12px;
          animation:fadeIn .3s ease .8s both;
        }
        .chat-input{
          flex:1;min-width:0;height:56px;border-radius:999px;
          border:1px solid #e0e0e0;background:#fff;
          color:#111;font-family:"T-Star Mono",monospace;
          font-size:16px;padding:0 20px;outline:none;
        }
        .chat-input::placeholder{color:#bbb}
        .chat-input-send{
          width:56px;height:56px;border-radius:50%;
          background:#1B6EF3;border:none;color:#fff;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;flex-shrink:0;box-shadow:${shadow};
          transition:background .12s;
        }
        .chat-input-send:hover{background:#1555c5}
        .chat-q{
          font-size:30px;font-weight:500;line-height:1.3;
          font-family:"T-Star Mono",monospace;color:#fff;margin-bottom:14px;
        }
        .chat-crossref{
          font-size:16px;font-weight:300;color:rgba(255,255,255,0.55);
          font-family:"T-Star Mono",monospace;margin-bottom:8px;
          font-style:italic;
        }
        .chat-quip{
          font-size:30px;font-weight:300;line-height:1.4;
          font-family:"T-Star Mono",monospace;color:currentColor;
        }
        .chat-quip strong{font-weight:700}
        .chat-opt{
          display:block;font-weight:300;
          font-family:"T-Star Mono",monospace;
          color:rgba(255,255,255,.85);font-size:30px;line-height:1.6;
        }

        /* Typewriter cursor — only shown while typing, hidden on complete lines */
        /* Typewriter cursor — zero width so it never displaces text */
        .tw-cursor{
          display:inline-block;
          width:0; height:0.85em;
          border-left:0.55em solid currentColor;
          opacity:0.9;
          vertical-align:text-bottom;
          margin-left:1px;
          overflow:visible;
        }

        /* ── Block cursor — persistent blinking rectangle ── */
        .cursor-block{
          display:inline-block;
          width:0.52em; height:0.85em;
          background:currentColor;
          vertical-align:text-bottom;
          margin-left:3px;
          animation:cursorBlink 1.1s step-end infinite;
        }
        @keyframes cursorBlink{
          0%,100%{opacity:1}
          50%{opacity:0}
        }

        /* ── CHAT BUTTONS ── */
        .btn-row{margin:32px 0 0;display:flex;align-items:center;gap:12px;animation:fadeIn .25s ease .3s both}
        .abc{
          width:56px;height:56px;border-radius:50%;border:${wborder};
          background:#FFD000;color:#111;
          font-family:"T-Star Mono",monospace;font-size:28px;font-weight:300;
          line-height:1;padding:0;padding-top:4px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;flex-shrink:0;
          box-shadow:${shadow};
          transition:background .12s,color .12s,border-color .12s,box-shadow .12s;
        }
        .abc:hover:not(.dim):not(.proc):not(.on){background:#1B6EF3;color:#fff;outline:${wborder};outline-offset:-1px}
        .abc.dim{background:#fff;color:#999;border-color:rgba(255,255,255,0.9)}
        .abc.dim:hover{background:#1B6EF3;color:#fff;border-color:rgba(255,255,255,.5);box-shadow:${shadow};outline:${wborder};outline-offset:-1px}
        .abc.on{background:#1B6EF3;color:#fff;border-color:rgba(255,255,255,.5);box-shadow:${shadow};outline:${wborder};outline-offset:-1px}
        .abc.proc{background:#fff;color:#999;border-color:#e0e0e0;box-shadow:none;cursor:default}
        .go{
          flex:1;height:56px;border-radius:999px;border:1px solid #e0e0e0;
          background:#fff;color:#bbb;cursor:default;
          display:flex;align-items:center;justify-content:center;
          transition:background .12s,color .12s,border-color .12s,box-shadow .12s;
        }
        .go.ready{
          background:#FFD000;color:#111;border-color:transparent;
          box-shadow:${shadow};outline:${wborder};outline-offset:-1px;cursor:pointer;
        }
        .go.proc{background:#1B6EF3;color:#fff;border-color:transparent;box-shadow:${shadow};cursor:default}

        /* ── END STATE ── */
        .end-headline{
          font-size:30px;font-weight:500;line-height:1.2;
          font-family:"T-Star Mono",monospace;color:currentColor;
          margin-bottom:12px;
        }
        .end-body{
          font-size:16px;font-weight:300;line-height:1.8;
          font-family:"T-Star Mono",monospace;
          color:currentColor;margin-bottom:24px;
        }
        .end-archetype{
          font-size:13px;font-weight:300;letter-spacing:.1em;
          text-transform:uppercase;
          color:rgba(255,255,255,0.45);
          font-family:"T-Star Mono",monospace;
          margin-bottom:20px;
        }
        .end-btn{
          display:inline-flex;align-items:center;gap:10px;
          background:rgba(255,255,255,0.15);
          border:1px solid rgba(255,255,255,0.3);
          border-radius:999px;color:#fff;
          font-family:"T-Star Mono",monospace;font-size:16px;
          padding:12px 24px;cursor:pointer;
          transition:background .12s;text-decoration:none;
        }
        .end-btn:hover{background:rgba(255,255,255,0.25)}
        .end-btn.primary{background:#fff;color:#1B6EF3;border-color:transparent}
        .end-btn.primary:hover{background:rgba(255,255,255,.9)}
        .end-btns{display:flex;gap:12px;flex-wrap:wrap}

        /* ── CARDS ── */
        .grid{padding:32px 0 36px;display:flex;flex-direction:column;gap:32px}

        /* ── BRUTAL CARD ──
           Rule: one border draws each line — NEVER two adjacent borders.
           bc-row draws the full perimeter (all 4 sides).
           bc-strip draws the vertical divider (border-right on left strip).
           bc-spacer / bc-eyebrow / bc-title draw horizontal lines via border-bottom ONLY.
           No border-top, no border-left, no border-right on inner column elements.
           Last item before bc-row's bottom border: no border-bottom needed. */
        .card{
          text-decoration:none;color:inherit;cursor:pointer;
          text-align:left;width:100%;height:100%;
          background:${isBrutalist?"#FFCE00":"none"};
          display:flex;flex-direction:column;
          border-radius:${R};overflow:${isBrutalist?"visible":"hidden"};
          ${isBrutalist?"outline:1px solid #000;box-sizing:border-box;":"border:none;aspect-ratio:3/4;"}
        }
        /* bc-row: NO border — card handles the perimeter */
        .bc-row{
          display:flex;flex-direction:row;align-items:stretch;width:100%;flex:1;
        }
        /* Strips: no border — bc-row covers top/bottom/left/right */
        /* Left strip gets border-right to draw the vertical divider */
        .bc-strip-l{flex-shrink:0;width:32px;border-right:1px solid #000;box-sizing:border-box}
        /* Right strip gets border-left to draw the other vertical divider */
        .bc-strip-r{flex-shrink:0;width:32px;border-left:1px solid #000;box-sizing:border-box}
        /* Main column */
        .bc-col{flex:1;display:flex;flex-direction:column;min-width:0;overflow:visible}
        /* Each stack element: border-bottom only — no top/left/right */
        .bc-spacer{height:32px;border-bottom:1px solid #000;box-sizing:border-box;flex-shrink:0}
        .bc-eyebrow{
          border-bottom:1px solid #000;box-sizing:border-box;
          display:flex;align-items:center;flex-shrink:0;
          font-size:15px;letter-spacing:.4em;text-transform:uppercase;
          font-family:"T-Star Mono",monospace;font-weight:700;
        }
        .bc-title{
          border-bottom:1px solid #000;box-sizing:border-box;
          font-size:30px;font-weight:700;line-height:1.3;
          font-family:"T-Star Mono",monospace;text-transform:uppercase;
          flex:1;
        }
        /* Image: 1:1 + 16px extra height to account for CTA overlap */
        .bc-image{position:relative;width:100%;overflow:hidden;aspect-ratio:1/1;flex-shrink:0;padding-bottom:16px}
        /* CTA wrap: left pop (-16px) + right padding (16px) + overlap image by 16px */
        .bc-cta-wrap{flex-shrink:0;overflow:visible;margin-left:-16px;padding-right:16px;margin-top:-16px}
        /* CTA face: full border (it's a standalone button, shadow hangs off it) */
        .bc-cta{
          display:flex;align-items:center;justify-content:space-between;
          padding:0 24px;height:64px;
          background:#FFCE00;border:1px solid #000;box-sizing:border-box;
          font-family:"T-Star Mono",monospace;font-size:30px;font-weight:400;
          color:#000;width:100%;
          transition:background .12s,color .12s;
        }
        .card:hover .bc-cta{background:#1B6EF3;color:#fff;border-color:#1B6EF3}
        /* Bottom spacer: 48px = 32px visible + 16px for shadow bleed */
        .bc-spacer-last{height:48px;flex-shrink:0}

        /* Default (non-brutal) card classes */
        .card-top{padding:24px 24px 20px;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
        .eyebrow{font-size:16px;letter-spacing:.14em;text-transform:uppercase;font-family:"T-Star Mono",monospace;font-weight:500;padding-bottom:6px;border-bottom:1px solid currentColor;display:inline-block}
        .headline{font-size:30px;font-weight:500;line-height:1.2;letter-spacing:-.01em;font-family:"T-Star Mono",monospace;margin-top:4px}
        .card-img{position:relative;flex:1;width:100%;overflow:hidden;display:block;padding:0 32px;box-sizing:border-box;border-radius:0 0 ${R} ${R}}
        .view-cta{
          position:absolute;bottom:32px;left:32px;right:32px;
          background:#FFD000;color:#111;border-radius:${R};
          height:64px;padding:0 1.5rem;font-size:16px;letter-spacing:.04em;
          font-family:"T-Star Mono",monospace;font-weight:500;
          display:flex;align-items:center;justify-content:space-between;
          box-shadow:${shadow};outline:${wborder};outline-offset:-1px;z-index:2;
        }

        /* ── PROJECT OVERLAY — fixed over everything ── */
        .proj-overlay{
          position:fixed;
          inset:0;
          z-index:100;
          overflow-y:auto;
          background:#fff;
        }
        .proj-overlay-inner{
          max-width:1220px;
          margin:0 auto;
          padding:0 36px 36px;
        }
        .proj-card{
          border-radius:32px;
          position:relative;
          overflow:hidden;
          margin-top:32px;
          padding:32px;
        }
        .proj-close-btn{
          position:absolute;top:20px;right:20px;
          width:48px;height:48px;border-radius:50%;
          background:#fff;border:1px solid rgba(255,255,255,0.9);
          box-shadow:${shadow};color:#111;
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;z-index:10;
          transition:background .12s,transform .15s;
          animation:fadeIn 200ms ${CURVE} 200ms both;
        }
        .proj-close-btn:hover{background:#1B6EF3;color:#fff;transform:scale(1.08)}
        .proj-close-btn:hover svg path{fill:#fff}
        .proj-card-in{animation:${anim.pageIn}}
        .proj-card-out{animation:pageOut ${T["1x"]}ms ${CURVE} both}
        /* split-gradient wrapper gets same animation */
        .proj-card-wrap{margin-top:32px;margin-bottom:36px}
        .proj-card-wrap.proj-card-in{animation:${anim.pageIn}}
        .proj-card-wrap.proj-card-out{animation:pageOut ${T["1x"]}ms ${CURVE} both}

        ${keyframes}

        /* ── ABOUT ── */
        .about{margin:32px 0;border-radius:${R};background:#f3f3f7;padding:2.5rem 2rem}
        .about-pill-btn:hover{background:#1B6EF3 !important;color:#fff !important}
        .resume-node-btn:not(.open):hover{background:#FFD132 !important}
        .resume-node-btn.open:hover{background:#1B6EF3 !important;color:#fff !important}
        .gb-card-btn{transition:transform 300ms cubic-bezier(0.5,0,0.85,1),filter 300ms cubic-bezier(0.5,0,0.85,1)}
        .gb-card-btn:hover{transform:translateY(-16px)}
        @media(max-width:720px){
          .gb-screen-frame{padding:36px 40px!important;border-radius:16px 16px 32px 16px!important}
          .gb-screen-wrapper{min-height:0!important}
          .gb-screen-content{font-size:15px!important;line-height:16px!important;padding:16px!important;height:220px!important;overflow-y:auto!important;text-shadow:none!important;scrollbar-width:thin;scrollbar-color:#3A4324 transparent}
          .gb-screen-content::-webkit-scrollbar{width:4px}
          .gb-screen-content::-webkit-scrollbar-thumb{background:#3A4324}
          .gb-screen-content::-webkit-scrollbar-track{background:transparent}
          .gb-screen-content *{font-weight:500!important}
          .gb-screen-content .chat-q{font-size:15px!important;line-height:16px!important;font-weight:700!important;text-shadow:none!important}
          .gb-screen-content .chat-quip{font-size:15px!important;line-height:16px!important;font-weight:700!important;text-shadow:none!important}
          .gb-end-headline{font-size:15px!important;line-height:16px!important;font-weight:700!important;text-shadow:none!important}
          .gb-end-body{font-size:15px!important;line-height:16px!important;font-weight:500!important}
          .gb-sel-opt{font-weight:700!important;text-shadow:none!important}
          .gb-outer{padding-left:0!important;padding-right:0!important}
          .gb-nav-body{line-height:18px!important}
          .gb-next-btn{height:24px!important;font-size:15px!important;padding:0 8px!important}
          .gb-next-btn svg{width:11px!important;height:11px!important}
          .gb-tree-reveal{zoom:0.5}
          .gb-ribbon-bar{height:4px!important;border-radius:0!important}
          .gb-ribbon-bars{gap:4px!important}
          .gb-ribbon-title{font-size:15px!important}
          .gb-home-header{padding:8px 0!important}
          .gb-topbar-row{height:40px!important}
          .gb-topbar-corner{height:40px!important;width:32px!important}
          .gb-topbar-pill{height:20px!important}
          .gb-led-container{width:48px!important}
          .gb-led{transform:scale(0.67);transform-origin:center}
          .gb-power-label{display:block!important}
          .gb-quiz-ribbon{height:36px!important}
          /* ── NON-GB QUIZ ── */
          .chat-card{min-height:340px!important;padding:20px 20px 24px!important;animation:none!important}
          .chat-q{font-size:17px!important;line-height:1.4!important}
          .chat-opt{font-size:17px!important;line-height:1.5!important}
          .chat-quip{font-size:17px!important;line-height:1.4!important}
          .end-headline{font-size:22px!important;line-height:1.25!important;margin-bottom:8px!important}
          .end-body{font-size:14px!important;line-height:1.6!important;margin-bottom:12px!important}
          .btn-row{gap:8px!important;margin:32px 0 0!important}
          .done-ctas{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:8px!important;margin:32px 0 0!important}
          .done-ctas .go,.done-ctas a{height:64px!important;font-size:17px!important;border-radius:999px!important}
          .done-ctas .nav-btn{height:64px!important;font-size:17px!important;padding:0 20px!important}
          .std-tree-reveal{zoom:0.5}
        }

        /* ── BRUTALIST PAGE LAYOUT ── same border rule as card ── */
        ${isBrutalist ? `
          /* bp-outer = same outer size as .w — outline sits outside box model, no collision with inner borders */
          .bp-outer{
            max-width:1220px;margin:0 auto;width:100%;padding:0;
            display:flex;flex-direction:row;align-items:stretch;
            outline:1px solid #000;box-sizing:border-box;
          }
          /* Side strips = 36px each (matches .w padding), border on inner edge = vertical constraint line */
          .bp-sl{flex-shrink:0;width:36px;border-right:1px solid #000;box-sizing:border-box}
          .bp-sr{flex-shrink:0;width:36px;border-left:1px solid #000;box-sizing:border-box}
          /* Center column: all rows stack here */
          .bp-col{
            flex:1;display:flex;flex-direction:column;
            padding:20px 0 0;gap:0;min-width:0;overflow:visible;
          }
          /* Content rows: border-bottom draws the line at row bottom */
          .bp-row{
            border-bottom:1px solid #000;box-sizing:border-box;
          }
          /* 32px spacer rows — border-bottom at bottom = the line */
          .bp-hspacer{height:32px;border-bottom:1px solid #000;box-sizing:border-box}
          /* Spacer between pill and nav: 0px height, just the border line */
          .bp-hspacer-nav{height:0;border-bottom:1px solid #000;box-sizing:border-box}
          /* Last row: no border — outline on bp-outer covers the bottom */
          .bp-row-last{box-sizing:border-box}
          /* Grid row spacer: spans all columns, carries top+bottom lines across gutters */
          .bc-row-spacer{
            grid-column:1/-1;height:32px;
            border-top:1px solid #000;border-bottom:1px solid #000;
            box-sizing:border-box;
          }
          /* Override .w inside brutal layout — no padding, no max-width (bp-col handles it) */
          .bp-col .w{padding:0;max-width:none}
          /* Override .hdr padding */
          .bp-col .hdr{padding:0}
          /* Grid inside bp-col: no row-gap at multi-col (spacer rows replace it), keep column-gap */
          .bp-col .grid{padding-top:0;align-items:stretch}
          /* Hide spacers on single-column mobile — native row-gap handles it there */
          .bc-row-spacer{display:none}
          @media(min-width:756px){
            .bp-col .grid{row-gap:0!important}
            .bc-row-spacer{display:block}
          }
        ` : ""}

        /* ── EXISTING BRUTALIST OVERRIDES ── */
        ${isBrutalist ? `
          body{background:#fff}
          .pill{
            border-radius:0 !important;
            border:1px solid #000 !important;
            box-shadow:none !important;
            width:100% !important;
          }
          .brutal-pill-wrap{
            display:block;
            width:100%;
            margin-left:-16px;
          }
          .brutal-pill-wrap > div{width:100% !important;display:block !important}
          .nav-row{overflow:visible}
          .nav-btns{
            overflow:visible;
            gap:24px;
            margin-left:-16px;
          }
          .nav-btn{
            border-radius:0 !important;
            box-shadow:none !important;
            border:1px solid #000 !important;
          }
          .brutal-btn-wrap{overflow:visible !important;display:inline-flex !important}
          .powered{border-radius:0 !important;outline:1px solid #000 !important;border:none !important}
          .card-top{border-bottom:none}
          .eyebrow{border-bottom:none !important}
          .view-cta{border-radius:0 !important;border:1px solid #000 !important;box-shadow:none !important;outline:none !important}
          .chat-card{border-radius:0 !important}
          .chat-close{border-radius:0 !important}
          .abc{border-radius:0 !important;box-shadow:none !important}
          .go{border-radius:0 !important}
          @media(max-width:380px){
            .brutal-pill-wrap{margin-left:0;width:100%}
            .nav-btns{margin-left:0}
          }
        ` : ""}
        @media(min-width:756px){
          .grid{display:grid!important;grid-template-columns:repeat(2,1fr);gap:32px;align-items:start;grid-auto-rows:auto}
          .headline{font-size:24px}
        }
        @media(min-width:960px){
          .grid{grid-template-columns:repeat(3,1fr)!important;align-items:start;grid-auto-rows:auto}
          .chat-card{height:480px}
          @keyframes chatGrow{from{height:60px}to{height:480px}}
        }
        @media(min-width:1220px){.headline{font-size:30px}}

        /* ── HERO (default theme) ── */
        .hero-nav-row{display:flex;align-items:flex-start;justify-content:space-between;margin-top:24px;gap:24px}
        .hero-text{display:flex;flex-direction:column;gap:4px;min-width:0;align-items:flex-start}
        .hero-text .headline{margin-top:0}
        @media(max-width:600px){
          .hero-nav-row{flex-direction:column}
          .hero-text{width:100%}
        }
        .hero-body{font-size:14px;font-weight:300;line-height:1.5;font-family:"T-Star Mono",monospace;color:#444}
        .hero-link{text-decoration:underline;background:none;border:none;cursor:pointer;font:inherit;padding:0;color:inherit}
        .nav-btns-right{display:flex;align-items:center;gap:12px;flex-shrink:0}
        @media(min-width:756px){.hero-text .headline{font-size:30px;margin-top:0}}
        @media(min-width:1220px){.hero-text .headline{font-size:30px;margin-top:0}}

        /* ── WORK two-col → single col below 960px ── */
        @media(max-width:959px){.work-two-col{flex-direction:column!important}}

        /* ── HOME DIVIDER ── */
        .home-divider{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:0}
        @media(min-width:756px){.home-divider{grid-column:1/-1}}
        .home-divider-title{font-size:30px;font-weight:500;line-height:1.2;letter-spacing:-.01em;font-family:"T-Star Mono",monospace;text-transform:uppercase}
        .home-divider-sub{font-size:14px;font-weight:300;font-family:"T-Star Mono",monospace}
        @media(min-width:756px){.home-divider-title{font-size:24px}}
        @media(min-width:1220px){.home-divider-title{font-size:30px}}
      `}</style>

      {/* ════════ FIXED WORDMARK LAYER ════════ */}
      <WordmarkFixed
        ref={wordmarkRef}
        placeholderRef={placeholderRef}
        theme={theme}
        hidden={brutalJustEntered || depressing || !!projectSlug}
      />

      {/* ════════ GAMEBOY / BRUTAL / DEFAULT PAGE SHELL ════════ */}
      {isGameboy ? (
        <>
        <GameboyShell
          projects={projects}
          mode={mode}
          openProject={openProject}
          openChat={openChat}
          closeChat={closeChat}
          cycleTheme={cycleTheme}
          setMode={setMode}
          phase={phase}
          twTyped={twTyped}
          twDone={twDone}
          selected={selected}
          selectOption={selectOption}
          confirmSelection={confirmSelection}
          redPulse={false}
          endState={endState}
          tags={tags}
          pathHistory={pathHistory}
          killNode={killNode}
          character={character}
          treeKey={treeKey}
          hideStart={isMobile}
          showWinOptions={showWinOptions}
          onShowWinOptions={() => setShowWinOptions(true)}
          warnBlink={warnBlink}
          quip={quip}
          showQuip={showQuip}
          locale={locale}
          toggleLocale={toggleLocale}
          wordmarkPlaceholderRef={placeholderRef}
          aiChatSlot={(mode === "aichat" || aiChatClosing) ? (
            <ChatSection onClose={closeAiChat} extMessages={aiChatMessages} setExtMessages={setAiChatMessages} extLoading={aiChatLoading} setExtLoading={setAiChatLoading} initialQ={aiChatInitialQ} compact/>
          ) : undefined}
          aboutSlot={(mode === "about" || aboutClosing) ? (
            <AboutSection onClose={closeAbout} openChat={openChat} initialOpenId={aboutInitialCard}/>
          ) : undefined}
          workSlot={(mode === "work" || workClosing) ? (
            <div style={{padding:"32px", fontFamily:'"T-Star Mono",monospace', background:"#f3f3f7", position:"relative"}}>
              <button onClick={closeWork} className="proj-close-btn" aria-label="Close work">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/></svg>
              </button>
              <div style={{marginBottom:32}}>
                <div style={{fontSize:12, fontWeight:500, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", borderBottom:"1px solid var(--border)", paddingBottom:6, display:"inline-block", marginBottom:12}}>WORK</div>
                <h1 style={{fontSize:30, fontWeight:500, lineHeight:1.2, margin:"0 0 8px", color:"#111"}}>Product, Motion &amp; Strategy</h1>
                <p style={{fontSize:15, fontWeight:300, color:"#555", margin:0, lineHeight:1.6}}>Learn more about the site&apos;s author below!</p>
              </div>
              <WorkProjectCards openProject={openProject}/>
            </div>
          ) : undefined}
          openAboutArticle={(cardId) => { setAboutInitialCard(cardId); setMode("about"); }}
        />
        </>
      ) : isBrutalist ? (
        <div className="bp-outer">
          <div className="bp-sl"/>
          <div className="bp-col">

            {/* Pill row — border-bottom = implicit top of spacer */}
            {!isChat && (
              <div className="bp-row">
                <div className="brutal-pill-wrap">
                  <BrutalShadow pressed={brutalJustEntered}>
                    <button className="pill" onClick={() => mode!=="home" && setMode("home")} aria-label="Home">
                      {/* Placeholder always mounted so placeholderRef stays live for syncPos */}
                      <WordmarkPlaceholder innerRef={placeholderRef}/>
                      {/* During brutal enter: real white SVG overlays the placeholder as face content */}
                      {(brutalJustEntered || depressing) && (
                        <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                          <WordmarkSVG color="#ffffff" deltaInner="#FFD132" deltaOuter="#000000"/>
                        </span>
                      )}
                    </button>
                  </BrutalShadow>
                </div>
              </div>
            )}

            {/* Line 1 — spacer below pill */}
            {!isChat && <div className="bp-hspacer-nav"/>}

            {/* Nav row — marginTop:48 moves section 16px lower than the 32px class default */}
            {!isChat && (
              <div className="bp-row" style={{overflow:"visible", paddingBottom:0}}>
                <nav className="nav-row" style={{alignItems:"flex-start", borderTop:"1px solid #000", overflow:"visible", marginTop:48}}>
                  <div className="nav-btns" style={{overflow:"visible", gap:24, marginTop:-18}}>
                    <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={true} onAboutToggle={closeAbout}/>
                  </div>
                  <div style={{flex:1, borderLeft:"1px solid #000", paddingLeft:16, display:"flex", flexDirection:"column"}}>
                    <div style={{fontFamily:'"T-Star Mono",monospace', fontWeight:700, fontSize:30, lineHeight:1.0, borderBottom:"1px solid #000", paddingBottom:3}}>
                      0→1 PRODUCT / Ai &amp; I
                    </div>
                    <div style={{fontFamily:'"T-Star Mono",monospace', fontWeight:300, fontSize:12, lineHeight:1.3, paddingTop:3}}>
                      Can Ai &amp; I replace a team? Learn{" "}
                      <button style={{color:"#1B6EF3", textDecoration:"underline", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:"inherit", fontWeight:"inherit", padding:0}} onClick={() => { setAboutInitialCard("zero-to-one"); setMode("about"); setTimeout(()=>document.getElementById("about-card-zero-to-one")?.scrollIntoView({behavior:"smooth",block:"start"}),350); }}>
                        how I built this site
                      </button>
                      , and why Ai can have taste.
                    </div>
                  </div>
                </nav>
              </div>
            )}

            {/* Chat row */}
            {isChat && (
              <>
                {/* Chat card row — content only, no buttons in brutal */}
                <div className="bp-row" style={{overflow:"visible"}}>
                  <div className="chat-outer" style={{padding:0}}>
                    <div className={`chat-card`} style={{background:cardBg,color:cardColor}}>
                      <button className="chat-close" onClick={closeChat} aria-label="Close"><Icon name="close" size={14}/></button>
                      <div className="chat-body">
                        <div className={`chat-indicator${(phase==="processing"||warnBlink)?" active":""}`}>
                          {phase==="processing" ? <Spinner/> : warnBlink ? <WarnBlink/> : null}
                        </div>
                        {phase==="question" && (
                          <>
                            {twTyped[0]!==undefined && (
                              <div className="chat-q" style={{}}>
                                {twTyped[0]}{twTyped.length===1&&!twDone&&<span className="tw-cursor"/>}
                              </div>
                            )}
                            <div>
                              {[0,1,2].map(i=>{
                                const lineText=twTyped[i+1];
                                if(!lineText)return null;
                                const isActive=i+1===twTyped.length-1&&!twDone;
                                const isSel=selected===i;
                                return(
                                  <span key={i} className="chat-opt" onClick={()=>selectOption(i as 0|1|2)} style={{cursor:"pointer",display:"block"}}>
                                    {isSel?<span style={{color:"#fff"}}>&gt; {lineText}</span>:lineText}
                                    {isActive&&<span className="tw-cursor"/>}
                                  </span>
                              );
                              })}
                            </div>
                          </>
                        )}
                        {phase==="processing"&&showQuip&&quip&&<QuipTyper text={quip}/>}
                        {phase==="done"&&endState&&(
                          <>
                            {showFreeform?(
                              <div style={{paddingBottom:8}}>
                                <AboutChat/>
                                <button onClick={()=>setShowFreeform(false)} style={{marginTop:12,background:"none",border:"none",color:"rgba(0,0,0,0.5)",fontFamily:'"T-Star Mono",monospace',fontSize:13,cursor:"pointer",padding:0}}>← back</button>
                              </div>
                            ):(
                              <>
                                <div className="end-headline">{END_COPY[endState].headline(character, endState==="win"&&tags.includes("pressure")&&!tags.includes("open"))}</div>
                                <div className="end-body">{localizedBody(tags, endState)}</div>
                                <div className="std-tree-reveal"><TreeReveal key={treeKey} path={pathHistory} killNodeKey={killNode} endState={endState} hideStart={isMobile}/></div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {/* Processing input — stays inside card area in brutal too */}
                    {phase==="processing"&&(
                      <div className="chat-input-row">
                        <input className="chat-input" placeholder="octopus" aria-label="Free response" autoFocus/>
                        <button className="chat-input-send" aria-label="Send"><ArrowRight size={20}/></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Spacer between card and buttons — 32px consistent with below */}
                {(phase==="question"||phase==="done"||phase==="processing")&&<div className="bp-hspacer"/>}

                {/* Button row — question phase: A/B/C selectors. Processing: dimmed. Done phase: Retry/Quit CTAs */}
                {(phase==="question"||phase==="done"||phase==="processing")&&(
                  <div className="bp-row" style={{overflow:"visible", paddingBottom:16}}>
                    <nav className="nav-row" style={{alignItems:"flex-start"}} aria-label="Chat options">
                      <div className="nav-btns" style={{overflow:"visible", gap:24}}>
                        {phase==="question" ? (
                          <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={true} onAboutToggle={closeAbout}
                            chatButtons={{ selected, onSelect: selectOption, onConfirm: confirmSelection }}
                          />
                        ) : phase==="processing" ? (
                          <div style={{display:"flex",alignItems:"center",gap:24,opacity:0.35,pointerEvents:"none"}}>
                            {(['A','B','C'] as const).map(l=>(
                              <button key={l} className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#e8e8e8",color:"#aaa",height:56,width:56,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:'"T-Star Mono",monospace',fontSize:28,fontWeight:300,cursor:"default"}}>{l}</button>
                            ))}
                            <button className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#e8e8e8",color:"#aaa",height:56,padding:"0 24px",width:"auto",fontFamily:'"T-Star Mono",monospace',fontSize:28,fontWeight:300,cursor:"default",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
                          </div>
                        ) : endState ? (
                          // Done phase CTAs
                          <div className="done-ctas" style={{display:"flex",alignItems:"center",gap:24,overflow:"visible",flexWrap:"wrap"}}>
                            {endState==="win" ? (
                              <>
                                <BrutalShadow>
                                  <a href="mailto:hello@mishasky.net" className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#1B6EF3",color:"#fff",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",height:56,padding:"0 24px",width:"auto",fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>Contact</a>
                                </BrutalShadow>
                                <BrutalShadow>
                                  <button onClick={()=>setShowFreeform(true)} className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#FFCE00",color:"#000",height:56,padding:"0 24px",width:"auto",fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>Fake Misha Chat</button>
                                </BrutalShadow>
                                <BrutalShadow>
                                  <button onClick={openChat} className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#fff",color:"#000",height:56,padding:"0 24px",width:"auto",fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>Try Again</button>
                                </BrutalShadow>
                              </>
                            ) : (
                              <>
                                <BrutalShadow>
                                  <button onClick={openChat} className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#FFCE00",color:"#000",height:56,padding:"0 24px",width:"auto",fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>Try Again</button>
                                </BrutalShadow>
                                <BrutalShadow>
                                  <button onClick={closeChat} className="nav-btn" style={{borderRadius:0,border:"1px solid #000",boxShadow:"none",background:"#fff",color:"#000",height:56,padding:"0 24px",width:"auto",fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>Quit</button>
                                </BrutalShadow>
                              </>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </nav>
                  </div>
                )}

                {/* Spacer below buttons */}
                {(phase==="question"||phase==="done"||phase==="processing")&&<div className="bp-hspacer"/>}
              </>
            )}

            {/* Line 3 — 32px spacer between nav/chat and cards */}
            {(!isChat || phase==="processing") && <div className="bp-hspacer"/>}

            {/* Grid row — hidden when about, work, or aichat is open */}
            {mode !== "about" && mode !== "work" && mode !== "aichat" && <div className="bp-row-last" style={{overflow:"visible"}}>
              <main className="grid" style={{marginTop:0}}>
                {isBrutalist ? (<>
                  {/* ── Row 1: Projects, Quiz, About ── */}

                  <button key="brutal-projects" className="card" onClick={() => setMode("work")}>
                    <div className="bc-row"><div className="bc-strip-l"/><div className="bc-col">
                      <div className="bc-spacer"/>
                      <div className="bc-eyebrow">PROJECTS</div>
                      <div className="bc-title">My work. Commerce, frontier Ai, Gaming and more.</div>
                      <div className="bc-image" style={{aspectRatio:"4/3",position:"relative",background:"transparent"}}>
                        <Image src="/images/About/work_thumb.gif" alt="" fill unoptimized sizes="33vw" style={{objectFit:"cover",opacity:1}}/>
                      </div>
                      <div className="bc-cta-wrap"><BrutalShadow block animateOnMount mountDelay={125}>
                        <div className="bc-cta"><span>View</span><ArrowRight size={20}/></div>
                      </BrutalShadow></div>
                      <div className="bc-spacer-last"/>
                    </div><div className="bc-strip-r"/></div>
                  </button>

                  <button key="brutal-quiz" className="card" onClick={() => { window.scrollTo({top:0,behavior:"smooth"}); openChat(); }} style={{background:"#D9D4CF"}}>
                    <div className="bc-row"><div className="bc-strip-l"/><div className="bc-col">
                      <div className="bc-spacer" style={{display:"flex",alignItems:"center",paddingLeft:16}}>
                        <div style={{width:72,height:20,border:"1px solid #000",borderRadius:100,boxShadow:"inset 4px 4px 8px rgba(0,0,0,0.1)"}}/>
                      </div>
                      <div className="bc-eyebrow">INTERACTIVE QUIZ</div>
                      <div className="bc-image" style={{background:"#889D58",aspectRatio:"unset",height:280,padding:0,display:"flex",flexDirection:"column",justifyContent:"flex-start"}}>
                        <div style={{fontFamily:'"T-Star Mono",monospace',fontWeight:700,fontSize:30,lineHeight:1.3,color:"#000",margin:0,padding:0}}>Is 0→1 right for you? Take the quiz!<span className="cursor-block"/></div>
                      </div>
                      <div style={{display:"flex",borderBottom:"1px solid #000",boxSizing:"border-box",flexShrink:0}}>
                        <div style={{flex:1,padding:"0 24px",height:64,display:"flex",alignItems:"center",fontFamily:'"T-Star Mono",monospace',fontWeight:400,fontSize:32,color:"#000"}}>PLAY THIS</div>
                        <div style={{width:64,borderLeft:"1px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:'"T-Star Mono",monospace',fontWeight:400,fontSize:32,color:"#5E619B"}}>?</div>
                      </div>
                      <div style={{display:"flex",flexShrink:0,overflow:"visible",marginLeft:-16,paddingRight:16,marginTop:-16,gap:0}}>
                        <div style={{flex:1,overflow:"visible"}}><BrutalShadow block animateOnMount mountDelay={150}><div onClick={e=>{e.stopPropagation();window.scrollTo({top:0,behavior:"smooth"});openChat();}} className="bc-cta" style={{background:"#D9D4CF"}}><span/><span/></div></BrutalShadow></div>
                        <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}><BrutalShadow block><div onClick={e=>{e.stopPropagation();setAboutInitialCard("rpg");window.scrollTo({top:0,behavior:"smooth"});setMode("about");}} className="bc-cta" style={{background:"#B1588E",color:"#fff",borderColor:"#000",justifyContent:"center"}}/></BrutalShadow></div>
                      </div>
                      <div className="bc-spacer-last"/>
                    </div><div className="bc-strip-r"/></div>
                  </button>

                  <button key="brutal-about" className="card" onClick={() => setMode("about")} style={{background:"#F5F0E8"}}>
                    <div className="bc-row"><div className="bc-strip-l"/><div className="bc-col">
                      <div className="bc-spacer"/>
                      <div className="bc-eyebrow">ABOUT</div>
                      <div className="bc-title">Process, opinions &amp; work experience (Resumè).</div>
                      <div className="bc-image" style={{aspectRatio:"4/3",position:"relative",background:"#F5F0E8"}}>
                        <Image src="/images/amazon/PLO Illustrtration_BLANK.png" alt="" fill sizes="33vw" style={{objectFit:"contain",objectPosition:"center bottom",opacity:1}}/>
                      </div>
                      <div className="bc-cta-wrap"><BrutalShadow block animateOnMount mountDelay={175}>
                        <div className="bc-cta"><span>View</span><ArrowRight size={20}/></div>
                      </BrutalShadow></div>
                      <div className="bc-spacer-last"/>
                    </div><div className="bc-strip-r"/></div>
                  </button>

                  {/* Thoughts divider — bc-eyebrow/bc-title/body with borders matching BUT WAIT pattern */}
                  <div key="brutal-divider-1" style={{gridColumn:"1/-1"}}><div className="bc-row-spacer"/></div>
                  <div key="brutal-thoughts" style={{gridColumn:"1/-1", borderBottom:"1px solid #000"}}>
                    <div className="bc-eyebrow">THOUGHTS</div>
                    <div className="bc-title">STAND FOR SOMETHING</div>
                    <div style={{fontSize:14,fontWeight:300,padding:"8px 0",fontFamily:'"T-Star Mono",monospace'}}>Or fall for anything.</div>
                  </div>
                  <div key="brutal-divider-2" style={{gridColumn:"1/-1"}}><div className="bc-row-spacer"/></div>

                  {/* ── Row 2: Blog, Chat, Design/Build ── */}

                  <button key="brutal-blog" className="card" onClick={()=>{setAboutInitialCard("who");setMode("about");setTimeout(()=>document.getElementById("brutal-about-card-who")?.scrollIntoView({behavior:"smooth",block:"start"}),350);}}>
                    <div className="bc-row"><div className="bc-strip-l"/><div className="bc-col">
                      <div className="bc-spacer"/>
                      <div className="bc-eyebrow">BLOG</div>
                      <div className="bc-title">On AI &apos;Taste&apos; And The Future</div>
                      <div style={{borderBottom:"1px solid #000",fontSize:14,fontWeight:300,padding:"8px 0",fontFamily:'"T-Star Mono",monospace',color:"#000",flexShrink:0}}>Taste Is Not Something Anyone Has. It&apos;s Something You Experience. What is taste? Who has it? Can AI have it?</div>
                      <div className="bc-image" style={{aspectRatio:"4/3",position:"relative",background:"#000"}}>
                        <Image src="/images/About/opinion.png" alt="" fill sizes="33vw" style={{objectFit:"cover",objectPosition:"top"}}/>
                      </div>
                      <div className="bc-cta-wrap"><BrutalShadow block animateOnMount mountDelay={225}>
                        <div className="bc-cta"><span>Read</span><ArrowRight size={20}/></div>
                      </BrutalShadow></div>
                      <div className="bc-spacer-last"/>
                    </div><div className="bc-strip-r"/></div>
                  </button>

                  <div key="brutal-chat" className="card" style={{cursor:"default"}}>
                    <div className="bc-row"><div className="bc-strip-l"/><div className="bc-col">
                      <div className="bc-spacer"/>
                      <div className="bc-eyebrow">POWERED BY CLAUDE AI</div>
                      <div className="bc-title" style={{flex:"0 0 auto"}}>WWMD. What Would Misha Do (or say)?</div>
                      <div style={{borderBottom:"1px solid #000",fontSize:14,fontWeight:300,padding:"8px 0",fontFamily:'"T-Star Mono",monospace',color:"#000",flexShrink:0}}>From Nirvana to the function of design. Ask anything.</div>
                      <div style={{flex:1}}/>
                      <div className="bc-cta-wrap" style={{display:"flex",gap:0}} onClick={e=>e.stopPropagation()}>
                        <div style={{flex:1,overflow:"visible"}}>
                          <BrutalShadow block>
                            <div className="bc-cta" style={{background:"#fff"}}>
                              <input
                                value={brutalHomeAiChatInput}
                                onChange={e=>setBrutalHomeAiChatInput(e.target.value)}
                                onKeyDown={e=>{if(e.key==="Enter"){e.stopPropagation();setAiChatMessages([]);setAiChatInitialQ(brutalHomeAiChatInput.trim()||undefined);setBrutalHomeAiChatInput("");window.scrollTo({top:0,behavior:"smooth"});setMode("aichat");}}}
                                placeholder="Ask anything..."
                                style={{flex:1,border:"none",outline:"none",fontFamily:'"T-Star Mono",monospace',fontSize:15,fontWeight:300,background:"transparent",color:"#000",width:"100%"}}
                              />
                            </div>
                          </BrutalShadow>
                        </div>
                        <div style={{width:64,overflow:"visible",flexShrink:0,marginLeft:-1}}>
                          <BrutalShadow block>
                            <div className="bc-cta" onClick={e=>{e.stopPropagation();setAiChatMessages([]);setAiChatInitialQ(brutalHomeAiChatInput.trim()||undefined);setBrutalHomeAiChatInput("");window.scrollTo({top:0,behavior:"smooth"});setMode("aichat");}} style={{justifyContent:"center",padding:0,cursor:"pointer"}}>
                              <ArrowRight size={20}/>
                            </div>
                          </BrutalShadow>
                        </div>
                      </div>
                      <div className="bc-spacer-last"/>
                    </div><div className="bc-strip-r"/></div>
                  </div>

                  <button key="brutal-design" className="card" onClick={()=>{setAboutInitialCard("zero-to-one");setMode("about");setTimeout(()=>document.getElementById("brutal-about-card-zero-to-one")?.scrollIntoView({behavior:"smooth",block:"start"}),350);}}>
                    <div className="bc-row"><div className="bc-strip-l"/><div className="bc-col">
                      <div className="bc-spacer"/>
                      <div className="bc-eyebrow">0→1</div>
                      <div className="bc-title">Design. <s style={{fontWeight:400}}>Prototype.</s> Build.</div>
                      <div style={{borderBottom:"1px solid #000",fontSize:13,fontWeight:300,padding:"8px 0",fontFamily:'"T-Star Mono",monospace',color:"#000",flexShrink:0}}>Why have 5 people do the job of one? Strategy, UX, visual design, motion, and enough code to ship – in one role.</div>
                      <div className="bc-image" style={{aspectRatio:"4/3",position:"relative",background:"#f0eeeb"}}>
                        <Image src="/images/About/anim-1.png" alt="" fill sizes="33vw" style={{objectFit:"cover",objectPosition:"center",opacity:1}}/>
                      </div>
                      <div className="bc-cta-wrap"><BrutalShadow block animateOnMount mountDelay={275}>
                        <div className="bc-cta"><span>View</span><ArrowRight size={20}/></div>
                      </BrutalShadow></div>
                      <div className="bc-spacer-last"/>
                    </div><div className="bc-strip-r"/></div>
                  </button>

                  {/* ── WORK divider ── */}
                  <div key="brutal-work-divider-1" style={{gridColumn:"1/-1"}}><div className="bc-row-spacer"/></div>
                  <div key="brutal-work-heading" style={{gridColumn:"1/-1"}}>
                    <div className="bc-eyebrow">WORK</div>
                    <div className="bc-title">SELECTED PROJECTS</div>
                  </div>

                  {/* ── Project cards — brutal style, full width ── */}
                  <div key="brutal-work-cards" style={{gridColumn:"1/-1"}}>
                    <BrutalProjectCards openProject={openProject}/>
                  </div>
                </>) : projects.map(p=>{
                  return(
                    <button key={p.slug} className="card" onClick={()=> p.slug !== "rpg" && p.slug !== "shrapnel" && openProject(p.slug)} style={p.slug==="rpg"?{background:"#D9D4CF"}:undefined}>
                      <div className="bc-row">
                        <div className="bc-strip-l"/>
                        <div className="bc-col">
                          {p.slug === "rpg" ? <>
                              <div className="bc-spacer" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                              <div style={{width:72,height:20,border:"1px solid #000",borderRadius:100,boxShadow:"inset 4px 4px 8px rgba(0,0,0,0.1)"}}/>
                            </div>
                            <div className="bc-eyebrow">FIT RPG</div>
                            <div className="bc-image" style={{background:"#889D58",aspectRatio:"unset",height:280,padding:32,display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start"}}>
                              <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:700,fontSize:12,letterSpacing:"0.4em",textTransform:"uppercase",color:"#000",borderBottom:"1px solid #000",paddingBottom:4,display:"inline-block"}}>FIT RPG</span>
                              <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:700,fontSize:30,lineHeight:1.3,color:"#000"}}>Role Preference Guide (R.P.G.)</span>
                            </div>
                            <div style={{flex:1,borderBottom:"1px solid #000",boxSizing:"border-box"}}/>
                            <div style={{display:"flex",borderBottom:"1px solid #000",boxSizing:"border-box",flexShrink:0}}>
                              <div style={{flex:1,padding:"0 24px",height:64,display:"flex",alignItems:"center",fontFamily:'"T-Star Mono",monospace',fontWeight:400,fontSize:32,color:"#000"}}>PLAY THIS</div>
                              <div style={{width:81,borderLeft:"1px solid #000",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:'"T-Star Mono",monospace',fontWeight:400,fontSize:32,color:"#5E619B"}}>?</div>
                            </div>
                            <div style={{display:"flex",flexShrink:0,overflow:"visible",marginLeft:-16,paddingRight:16,marginTop:-16,gap:0}}>
                              <div style={{flex:1,overflow:"visible",position:"relative"}}>
                                <BrutalShadow block>
                                  <div onClick={e=>{e.stopPropagation();window.scrollTo({top:0,behavior:"smooth"});openChat();}}
                                    className="bc-cta" style={{background:"#D9D4CF"}}>
                                    <span>PLAY</span><ArrowRight size={20}/>
                                  </div>
                                </BrutalShadow>
                              </div>
                              <div style={{width:81,overflow:"visible",flexShrink:0,marginLeft:-1}}>
                                <BrutalShadow block>
                                  <div onClick={e=>{e.stopPropagation();openProject("rpg");}}
                                    className="bc-cta" style={{background:"#B1588E",color:"#fff",borderColor:"#000",justifyContent:"center"}}>
                                    <span>?</span>
                                  </div>
                                </BrutalShadow>
                              </div>
                            </div>
                          </> : <>
                            <div className="bc-spacer"/>
                            <div className="bc-eyebrow">{p.category}</div>
                            <div className="bc-title">{p.title}</div>
                            <div className="bc-image" style={{background:p.thumbBg}}>
                              {p.thumb&&<Image src={p.thumb} alt={p.client} fill sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw" style={{objectFit:"contain",objectPosition:"center"}}/>}
                            </div>
                            <div className="bc-cta-wrap">
                              <BrutalShadow block>
                                {p.slug === "shrapnel"
                                  ? <div className="bc-cta" style={{opacity:0.5,cursor:"not-allowed"}}><span>COMING SOON</span></div>
                                  : <div className="bc-cta"><span>View</span><ArrowRight size={20}/></div>
                                }
                              </BrutalShadow>
                            </div>
                          </>}
                          <div className="bc-spacer-last"/>
                        </div>
                        <div className="bc-strip-r"/>
                      </div>
                    </button>
                  );
                })}
              </main>
            </div>}

            {/* Brutal about section — inline in bp-outer */}
            {mode === "about" && (
              <div className="bp-row-last">
                <BrutalAboutSection onClose={closeAbout} openChat={openChat} initialOpenId={aboutInitialCard}/>
              </div>
            )}

            {/* Brutal AI chat section */}
            {mode === "aichat" && (
              <div className="bp-row-last">
                <BrutalChatSection onClose={closeAiChat} extMessages={aiChatMessages} setExtMessages={setAiChatMessages} extLoading={aiChatLoading} setExtLoading={setAiChatLoading} initialQ={aiChatInitialQ}/>
              </div>
            )}

            {/* Brutal work section */}
            {mode === "work" && (
              <div className="bp-row-last">
                <BrutalWorkSection onClose={closeWork} openChat={openChat} openProject={openProject} theme={theme} onSelectTheme={selectTheme}/>
              </div>
            )}

          </div>
          <div className="bp-sr"/>
        </div>
      ) : (
        <>
        {/* ════════ HEADER (non-brutal) ════════ */}
        {!isChat && (
          <header className="hdr">
          <div className="w">
            {isBrutalist ? (
              <div className="brutal-pill-wrap">
                <BrutalShadow pressed={brutalJustEntered}>
                  <button className="pill" onClick={() => mode!=="home" && setMode("home")} aria-label="Home">
                    <WordmarkPlaceholder innerRef={placeholderRef}/>
                    {(brutalJustEntered || depressing) && (
                      <span style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                        <WordmarkSVG color="#ffffff" deltaInner="#FFD132" deltaOuter="#000000"/>
                      </span>
                    )}
                  </button>
                </BrutalShadow>
              </div>
            ) : (
              <button className="pill" onClick={() => mode!=="home" && setMode("home")} aria-label="Home">
                <WordmarkPlaceholder innerRef={placeholderRef} />
              </button>
            )}
            {isBrutalist ? (
              <nav className="nav-row" aria-label="Site navigation">
                <div className="nav-btns">
                  <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={true} onAboutToggle={closeAbout}/>
                </div>
                <div className="powered-wrap">
                  <BrutalShadow pressed>
                    <span className="powered">Powered by Claude / AI interaction</span>
                  </BrutalShadow>
                </div>
              </nav>
            ) : (
              <div className="hero-nav-row">
                <nav className="nav-btns-right" aria-label="Site navigation">
                  <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={false} onAboutToggle={closeAbout}/>
                </nav>
                <div className="hero-text">
                  <h1 className="headline">0→1 PRODUCT / Ai &amp; I</h1>
                  <p className="hero-body" style={{color:"#111"}}>
                    Can Ai &amp; I replace a team? Learn{" "}
                    <button className="hero-link" onClick={() => { setAboutInitialCard("zero-to-one"); setMode("about"); setTimeout(()=>document.getElementById("about-card-zero-to-one")?.scrollIntoView({behavior:"smooth",block:"start"}),350); }}>
                      how I built this site
                    </button>
                    , and why Ai can have taste.
                  </p>
                </div>
              </div>
            )}
          </div>
          </header>
        )}

      {/* ════════ ABOUT ════════ */}
      {(mode === "about" || aboutClosing) && (
        <div className="w">
          <div
            className={`about${aboutClosing ? " proj-card-out" : " proj-card-in"}`}
            style={isBrutalist ? {outline:"1px solid #000",boxSizing:"border-box"} : {borderRadius:32, background:"#f3f3f7", padding:0, overflow:"hidden"}}
          >
            {isBrutalist
              ? <BrutalAboutSection onClose={closeAbout} openChat={openChat} initialOpenId={aboutInitialCard}/>
              : <AboutSection onClose={closeAbout} openChat={openChat} initialOpenId={aboutInitialCard}/>
            }
          </div>
        </div>
      )}

      {/* ════════ AI CHAT ════════ */}
      {(mode === "aichat" || aiChatClosing) && (
        <div className="w">
          <div
            className={`about${aiChatClosing ? " proj-card-out" : " proj-card-in"}`}
            style={isBrutalist ? {outline:"1px solid #000",boxSizing:"border-box",padding:0} : {borderRadius:32, background:"#f3f3f7", padding:0, overflow:"hidden"}}
          >
            {isBrutalist
              ? <BrutalChatSection onClose={closeAiChat} extMessages={aiChatMessages} setExtMessages={setAiChatMessages} extLoading={aiChatLoading} setExtLoading={setAiChatLoading} initialQ={aiChatInitialQ}/>
              : <ChatSection onClose={closeAiChat} extMessages={aiChatMessages} setExtMessages={setAiChatMessages} extLoading={aiChatLoading} setExtLoading={setAiChatLoading} initialQ={aiChatInitialQ}/>
            }
          </div>
        </div>
      )}

      {/* ════════ WORK ════════ */}
      {(mode === "work" || workClosing) && (
        <div className="w">
          <div
            className={`about${workClosing ? " proj-card-out" : " proj-card-in"}`}
            style={{borderRadius:32, background:"#f3f3f7", padding:0, overflow:"hidden"}}
          >
            <WorkSection
              onClose={closeWork}
              openChat={openChat}
              openProject={openProject}
              theme={theme}
              onSelectTheme={selectTheme}
            />
          </div>
        </div>
      )}

      {/* ════════ CHAT ════════ */}
      {isChat && (
        <div className="chat-outer">
          <div className="w">
            <div
              className={`chat-card`}
              style={{ background: cardBg, color: cardColor }}
            >
              <button className="chat-close" onClick={closeChat} aria-label="Close">
                <Icon name="close" size={14}/>
              </button>

              <div className="chat-body">
                {/* Spinner during processing, empty otherwise */}
                <div className={`chat-indicator${(phase === "processing" || warnBlink) ? " active" : ""}`}>
                  {phase === "processing" ? <Spinner/> : warnBlink ? <WarnBlink/> : null}
                </div>

                {/* spacer pushes content down — card is justify-content:flex-end */}

                {/* question phase — typewriter */}
                {phase === "question" && (
                  <>
                    {/* Line 0: question */}
                    {twTyped[0] !== undefined && (
                      <div className="chat-q" style={{}}>
                        {twTyped[0]}
                        {/* cursor only while question is still typing — disappears the moment it's done */}
                        {twTyped.length === 1 && !twDone && <span className="tw-cursor"/>}
                      </div>
                    )}
                    {/* Lines 1-3: options typed at 3x question speed */}
                    <div>
                      {[0,1,2].map(i => {
                        const lineIdx = i + 1;
                        const lineText = twTyped[lineIdx];
                        if (!lineText) return null;
                        // Only show cursor if this is the last rendered line AND still typing
                        const isActivelyTyping = lineIdx === twTyped.length - 1 && !twDone;
                        const isSelected = selected === i;
                        return (
                          <span key={i}
                            className="chat-opt"
                            onClick={() => selectOption(i as 0|1|2)}
                            style={{cursor:"pointer", display:"block", }}
                          >
                            {isBinaryQ ? (
                              <span style={{display:"inline-flex",alignItems:"center",gap:12,color: isSelected ? "#fff" : undefined}}>
                                {isSelected && <span style={{fontWeight:500}}>&gt;&nbsp;</span>}
                                {BINARY_ICONS[i]}
                              </span>
                            ) : isSelected
                              ? <span style={{color:"#fff",fontWeight:500}}>&gt; {lineText}</span>
                              : lineText
                            }
                            {isActivelyTyping && !isBinaryQ && <span className="tw-cursor"/>}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* processing phase — quip types on with same effect */}
                {phase === "processing" && showQuip && quip && (
                  <QuipTyper text={quip} />
                )}

                {phase === "done" && endState && (
                  <>
                    {showFreeform ? (
                      <div style={{paddingBottom:8}}>
                        <AboutChat/>
                        <button onClick={()=>{setShowFreeform(false);setFreeformResponse(null);}} style={{marginTop:12,background:"none",border:"none",color:"rgba(0,0,0,0.5)",fontFamily:'"T-Star Mono",monospace',fontSize:13,cursor:"pointer",padding:0}}>← back</button>
                      </div>
                    ) : (
                      <>
                        <div className="end-headline">{END_COPY[endState].headline(character, endState==="win"&&tags.includes("pressure")&&!tags.includes("open"))}</div>
                        <div className="end-body">{localizedBody(tags, endState)}</div>
                        <div className="std-tree-reveal"><TreeReveal key={treeKey} path={pathHistory} killNodeKey={killNode} endState={endState} hideStart={isMobile}/></div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* A/B/C + go always rendered — dimmed during processing, CTAs during done */}
            <div className={`btn-row${phase === "done" ? " done-ctas" : ""}`}>
              {phase !== "done" ? (
                <>
                  {([0,1,2] as const).map(i => {
                    let c = "abc";
                    if (phase === "processing") c += " proc";
                    else if (selected !== null) c += selected === i ? " on" : " dim";
                    return (
                      <button key={i} className={c}
                        onClick={phase === "question" ? () => selectOption(i) : undefined}
                        aria-label={`Option ${String.fromCharCode(65+i)}`}>
                        {String.fromCharCode(65+i)}
                      </button>
                    );
                  })}
                  <button
                    className={`go${phase === "processing" ? " proc" : selected !== null ? " ready" : ""}`}
                    onClick={selected !== null && phase === "question" ? confirmSelection : undefined}
                    aria-label="Confirm">
                    <ArrowRight size={22}/>
                  </button>
                </>
              ) : !showFreeform && endState ? (
                <>
                  {endState === "win" && (
                    <a href="mailto:hello@mishasky.net" className="go ready"
                      style={{textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",height:64,fontSize:30,background:"#1B6EF3",color:"#fff"}}>
                      Contact
                    </a>
                  )}
                  {endState === "win" && (
                    <button onClick={() => setShowFreeform(true)} className="go ready" style={{fontSize:30,fontWeight:300,height:64}}>
                      Fake Misha Chat
                    </button>
                  )}
                  {endState === "win" && (
                    <button onClick={openChat} className="go"
                      style={{fontSize:30,fontWeight:300,height:64,background:"none",border:"1px solid #ccc",color:"#555",cursor:"pointer"}}>
                      Try Again
                    </button>
                  )}
                  {endState !== "win" && (
                    <button className="go ready" onClick={openChat} style={{fontSize:30,fontWeight:300,height:64}}>
                      { locale === "ja" ? JA.cta_retry : "Try Again" }
                    </button>
                  )}
                  {endState !== "win" && (
                    <button onClick={() => setTreeKey(k => k + 1)} style={{fontSize:30,fontWeight:300,height:64,background:"none",border:"1px solid #444",color:"#888",cursor:"pointer",flex:"0 0 auto",padding:"0 24px",borderRadius:999,fontFamily:'"T-Star Mono",monospace'}}>
                      Refresh
                    </button>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ════════ HOME CARDS + WORK ════════ */}

      <div className="w">
        {/* ── Row 1 + Divider + Row 2 ── */}
        <main className="grid" style={{marginTop: isChat ? 32 : 0}}>

          {/* ── Row 1: Projects ── */}
          <button
            className="card"
            onClick={() => setMode("work")}
            style={{background:"#F5E3CC", position:"relative", overflow:"hidden"}}
          >
            {/* work_thumb.gif — play-once background */}
            <Image
              src="/images/About/work_thumb.gif"
              alt=""
              fill
              unoptimized
              sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
              style={{objectFit:"cover",objectPosition:"center",pointerEvents:"none",zIndex:0}}
            />
            {/* Vertical gradient overlay: peach 60% top → peach 30% bottom */}
            <div style={{position:"absolute",inset:0,zIndex:1,background:"linear-gradient(to bottom, rgba(245,227,204,0.6) 0%, rgba(245,227,204,0) 100%)",pointerEvents:"none"}} />
            <div className="card-top" style={{background:"transparent",color:"#111",position:"relative",zIndex:2}}>
              <span className="eyebrow" style={{color:"#111",borderBottomColor:"rgba(0,0,0,0.25)"}}>PROJECTS</span>
              <h2 className="headline">My work. Commerce, frontier Ai, Gaming and more.</h2>
            </div>
            <div className="card-img" style={{background:"transparent",position:"relative",zIndex:2}}>
              <div className="view-cta" style={{color:"#111"}}>
                <span style={{fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>View</span>
                <ArrowRight size={18}/>
              </div>
            </div>
          </button>

          {/* ── Row 1: Interactive Quiz ── */}
          <button
            className="card"
            onClick={() => { window.scrollTo({top:0,behavior:"smooth"}); openChat(); }}
            style={{background:"#D9D4CF",aspectRatio:"3/4",boxShadow:"inset 1px 1px 0 rgba(255,255,255,0.6),inset 16px 8px 8px rgba(255,242,199,0.25),inset -8px -8px 16px rgba(56,60,131,0.25),4px 4px 16px rgba(0,0,0,0.16)"}}
          >
            <div style={{flex:1,position:"relative",padding:24,display:"flex",flexDirection:"column",background:"transparent"}}>
              <div style={{borderRadius:20,padding:20,background:"#889D58",boxShadow:"inset 8px 8px 16px rgba(56,60,131,0.36),inset -8px -8px 16px rgba(151,149,74,1)",border:"1px solid rgba(255,255,255,0.5)",display:"flex",flexDirection:"column",gap:8,alignItems:"flex-start"}}>
                <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:500,fontSize:16,letterSpacing:"0.14em",textTransform:"uppercase" as const,color:"#3A4324",borderBottom:"1px solid #3A4324",paddingBottom:4,display:"inline-block",alignSelf:"flex-start"}}>INTERACTIVE QUIZ</span>
                <h2 style={{fontFamily:'"T-Star Mono",monospace',fontWeight:400,fontSize:30,lineHeight:1.2,color:"#3A4324",margin:0}}>Is 0→1 right for you? Take the quiz!<span className="cursor-block"/></h2>
              </div>
              <div style={{position:"absolute",bottom:32,left:32,right:32,display:"flex",gap:16}}>
                {(["PLAY","ABOUT"] as const).map(label => (
                  <div
                    key={label}
                    onClick={(e) => { e.stopPropagation(); if(label==="PLAY"){window.scrollTo({top:0,behavior:"smooth"});openChat();}else{setAboutInitialCard("rpg");window.scrollTo({top:0,behavior:"smooth"});setMode("about");} }}
                    style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8,cursor:"pointer"}}
                  >
                    <span style={{fontFamily:'"T-Star Mono",monospace',fontWeight:700,fontSize:30,color:"#383C83"}}>{label}</span>
                    <div style={{width:"100%",height:64,borderRadius:100,background:"rgba(0,0,0,0.08)",boxShadow:"inset 0 2px 6px rgba(0,0,0,0.3),inset 0 -1px 2px rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
                      <div style={{width:"100%",height:32,borderRadius:100,background:"linear-gradient(180deg,rgba(206,200,206,1) 0%,rgba(175,170,175,1) 100%)",boxShadow:"1px 1px 3px rgba(0,0,0,0.5),inset 0 1px 3px rgba(255,255,255,0.5)"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </button>

          {/* ── Row 1: About ── */}
          <button className="card" onClick={() => setMode("about")} style={{background:"#F5F0E8"}}>
            <div className="card-top" style={{background:"#F5F0E8",color:"#111"}}>
              <span className="eyebrow">ABOUT</span>
              <h2 className="headline">Process, opinions &amp; work experience (Resumè).</h2>
            </div>
            <div className="card-img" style={{background:"#F5F0E8",padding:0}}>
              <div style={{position:"absolute",inset:0,overflow:"hidden"}}>
                <Image
                  src="/images/amazon/PLO Illustrtration_BLANK.png"
                  alt="Misha avatar"
                  fill
                  sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
                  style={{objectFit:"contain",objectPosition:"center bottom"}}
                />
              </div>
              <div className="view-cta" style={{color:"#111"}}>
                <span style={{fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>View</span>
                <ArrowRight size={18}/>
              </div>
            </div>
          </button>

          {/* ── Thoughts divider ── */}
          <div className="home-divider">
            <span className="eyebrow" style={{color:"#111"}}>THOUGHTS</span>
            <div className="home-divider-title">STAND FOR SOMETHING</div>
            <div className="home-divider-sub" style={{color:"#111"}}>Or fall for anything.</div>
          </div>

          {/* ── Row 2: AI Taste Blog ── */}
          <button className="card" onClick={()=>{setAboutInitialCard("who");setMode("about");setTimeout(()=>document.getElementById("about-card-who")?.scrollIntoView({behavior:"smooth",block:"start"}),350);}} style={{background:"#4387B0",color:"#fff",position:"relative",overflow:"hidden"}}>
            <Image
              src="/images/About/opinion.png"
              alt=""
              fill
              sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
              style={{objectFit:"cover",objectPosition:"top",zIndex:0,pointerEvents:"none"}}
            />
            {/* Gradient overlay: #4387B0 90% top → 50% bottom */}
            <div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",
              background:"linear-gradient(to bottom, rgba(67,135,176,0.9) 0%, rgba(67,135,176,0.5) 100%)"}} />
            <div className="card-top" style={{background:"transparent",color:"#fff",position:"relative",zIndex:2}}>
              <span className="eyebrow" style={{borderBottomColor:"rgba(255,255,255,0.35)",color:"#fff"}}>BLOG</span>
              <h2 className="headline" style={{color:"#fff"}}>On AI &apos;Taste&apos; And The Future</h2>
              <p style={{fontSize:14,lineHeight:1.5,fontFamily:'"T-Star Mono",monospace',fontWeight:400,marginTop:4,color:"#fff"}}>Taste Is Not Something Anyone Has. It&apos;s Something You Experience. What is taste? Who has it? Can AI have it?</p>
            </div>
            <div className="card-img" style={{background:"transparent",position:"relative",zIndex:2}}>
              <div className="view-cta" style={{color:"#111"}}>
                <span style={{fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>Read</span>
                <ArrowRight size={18}/>
              </div>
            </div>
          </button>

          {/* ── Row 2: Claude AI Chat ── */}
          <button className="card" style={{background:"#f3f3f7",color:"#111"}}>
            <div className="card-top" style={{background:"#f3f3f7",color:"#111"}}>
              <span className="eyebrow" style={{color:"#111",borderBottomColor:"rgba(0,0,0,0.25)"}}>POWERED BY CLAUDE AI</span>
              <h2 className="headline">WWMD. What Would Misha Do (or say)?</h2>
              <p style={{fontSize:14,lineHeight:1.5,fontFamily:'"T-Star Mono",monospace',fontWeight:300,color:"#111"}}>Knows my work, my takes, my process. Ask.</p>
              <p style={{fontSize:14,lineHeight:1.5,fontFamily:'"T-Star Mono",monospace',fontWeight:300,color:"#111",marginTop:4}}>From Nirvana to the function of design. Ask anything.</p>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"0 24px 24px"}}>
              <div className="chat-input-row" style={{margin:0}} onClick={e=>e.stopPropagation()}>
                <input
                  className="chat-input"
                  placeholder="Ask anything..."
                  aria-label="Chat with Misha AI"
                  value={homeAiChatInput}
                  onChange={e=>setHomeAiChatInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"){e.stopPropagation();setAiChatMessages([]);setAiChatInitialQ(homeAiChatInput.trim()||undefined);setHomeAiChatInput("");window.scrollTo({top:0,behavior:"smooth"});setMode("aichat");}}}
                  style={{cursor:"text"}}
                />
                <button className="chat-input-send" aria-label="Open chat"
                  onClick={e=>{e.stopPropagation();setAiChatMessages([]);setAiChatInitialQ(homeAiChatInput.trim()||undefined);setHomeAiChatInput("");window.scrollTo({top:0,behavior:"smooth"});setMode("aichat");}}>
                  <ArrowRight size={20}/>
                </button>
              </div>
            </div>
          </button>

          {/* ── Row 2: Design · Prototype · Build ── */}
          <button className="card" onClick={()=>{setAboutInitialCard("zero-to-one");setMode("about");setTimeout(()=>document.getElementById("about-card-zero-to-one")?.scrollIntoView({behavior:"smooth",block:"start"}),350);}} style={{background:"#111",color:"#fff",position:"relative",overflow:"hidden"}}>
            {/* Full-bleed background at 20% opacity */}
            <Image
              src={"/images/About/Screenshot 2026-09-15 at 5.25.01PM.png"}
              alt=""
              fill
              sizes="(max-width:756px) 100vw,(max-width:960px) 50vw,33vw"
              style={{objectFit:"cover",objectPosition:"center",opacity:0.20,zIndex:0,pointerEvents:"none"}}
            />
            <div className="card-top" style={{background:"transparent",color:"#fff",position:"relative",zIndex:1}}>
              <span className="eyebrow" style={{color:"#fff",borderBottomColor:"rgba(255,255,255,0.3)"}}>0→1</span>
              <h2 className="headline" style={{color:"#fff"}}>Design. <s style={{fontWeight:400}}>Prototype.</s> Build.</h2>
              <p style={{fontSize:13,lineHeight:1.5,fontFamily:'"T-Star Mono",monospace',fontWeight:400,marginTop:8,color:"#fff"}}>Why have 5 people do the job of one? Strategy, UX, visual design, motion, and enough code to ship – in one role.</p>
            </div>
            <div className="card-img" style={{background:"transparent",position:"relative",zIndex:1}}>
              <div className="view-cta">
                <span style={{fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:300}}>View</span>
                <ArrowRight size={18}/>
              </div>
            </div>
          </button>

        </main>

        {/* ── Work — all projects a level down ── */}
        <section id="work" style={{paddingTop:48,paddingBottom:48}}>
          <div style={{marginBottom:32}}>
            <span className="eyebrow">PROJECTS</span>
            <h2 className="headline" style={{marginTop:4}}>My work. Commerce, frontier Ai, Gaming and more.</h2>
          </div>
          <WorkProjectCards openProject={openProject} />
        </section>

      </div>
        </> 
      )} {/* end non-brutal ternary */}

      {projectSlug && (() => {
        const p = getProject(projectSlug);
        if (!p) return null;
        const dark = p.theme === "dark";
        return (
          <div className="proj-overlay">
            {isBrutalist ? (
              /* ── BRUTAL OVERLAY — full bp-outer layout matching home ── */
              <div className="bp-outer" style={{minHeight:"100vh"}}>
                <div className="bp-sl"/>
                <div className="bp-col">

                  {/* Pill row — same as home */}
                  <div className="bp-row">
                    <div className="brutal-pill-wrap">
                      <BrutalShadow>
                        <button className="pill" onClick={closeProject} aria-label="Home">
                          <Wordmark />
                        </button>
                      </BrutalShadow>
                    </div>
                  </div>

                  {/* Spacer between pill and nav */}
                  <div className="bp-hspacer-nav"/>

                  {/* Done button — same pattern as BrutalAboutSection */}
                  {!isChat && (
                    <div className="bp-row" style={{paddingBottom:0}}>
                      <div style={{height:56,display:"flex",justifyContent:"flex-end",alignItems:"flex-end"}}>
                        <div style={{marginBottom:16,marginRight:16,overflow:"visible"}}>
                          <BrutalShadow>
                            <button onClick={closeProject} aria-label="Close project"
                              style={{fontFamily:'"T-Star Mono",monospace',fontSize:16,fontWeight:700,
                                background:"#FFD000",border:"1px solid #000",
                                padding:"0 24px",height:40,cursor:"pointer",
                                display:"flex",alignItems:"center"}}>
                              Done
                            </button>
                          </BrutalShadow>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nav row — same as home */}
                  {!isChat && (
                  <div className="bp-row" style={{overflow:"visible", paddingBottom:16}}>
                    <nav className="nav-row" style={{alignItems:"flex-start"}} aria-label="Site navigation">
                      <div className="nav-btns" style={{overflow:"visible", gap:24}}>
                        <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={true} onAboutToggle={closeAbout}/>
                      </div>
                      <div style={{marginLeft:"auto", marginRight:16, overflow:"visible"}}>
                        <BrutalShadow pressed>
                          <span className="powered">Powered by Claude / AI interaction</span>
                        </BrutalShadow>
                      </div>
                    </nav>
                  </div>
                  )}

                  {/* Chat row — shown when mode==="chat" inside the overlay */}
                  {isChat && (
                    <>
                      <div className="bp-row" style={{overflow:"visible"}}>
                        <div className="chat-outer" style={{padding:0}}>
                          <div className={`chat-card`} style={{background:cardBg,color:cardColor}}>
                            <button className="chat-close" onClick={closeChat} aria-label="Close"><Icon name="close" size={14}/></button>
                            <div className="chat-body">
                              <div className={`chat-indicator${(phase==="processing"||warnBlink)?" active":""}`}>
                                {phase==="processing" ? <Spinner/> : warnBlink ? <WarnBlink/> : null}
                              </div>
                              {phase==="question" && (
                                <>
                                  {twTyped[0]!==undefined && (
                                    <div className="chat-q" style={{}}>
                                      {twTyped[0]}{twTyped.length===1&&!twDone&&<span className="tw-cursor"/>}
                                    </div>
                                  )}
                                  <div>
                                    {[0,1,2].map(i=>{
                                      const lineText=twTyped[i+1];
                                      if(!lineText)return null;
                                      const isActive=i+1===twTyped.length-1&&!twDone;
                                      const isSel=selected===i;
                                      return(
                                        <span key={i} className="chat-opt" onClick={()=>selectOption(i as 0|1|2)} style={{cursor:"pointer",display:"block"}}>
                                          {isSel?<span style={{color:"#fff"}}>&gt; {lineText}</span>:lineText}
                                          {isActive&&<span className="tw-cursor"/>}
                                        </span>
                                    );
                                    })}
                                  </div>
                                </>
                              )}
                              {phase==="processing"&&showQuip&&quip&&<QuipTyper text={quip}/>}
                              {phase==="done"&&endState&&(
                                <>
                                  {showFreeform?(<div style={{paddingBottom:8}}>
                                    <div style={{opacity:0.6,fontSize:16,marginBottom:12,fontFamily:'"T-Star Mono",monospace'}}>{ locale === 'ja' ? JA.cta_more : 'Anything further to add?' }</div>
                                    <div className="chat-input-row" style={{margin:0}}>
                                      <input className="chat-input" placeholder="..." aria-label="Open message" autoFocus/>
                                      <button className="chat-input-send" aria-label="Send"><ArrowRight size={20}/></button>
                                    </div>
                                    <button onClick={()=>setShowFreeform(false)} style={{marginTop:12,background:"none",border:"none",color:"rgba(0,0,0,0.5)",fontFamily:'"T-Star Mono",monospace',fontSize:13,cursor:"pointer",padding:0}}>← back</button>
                                  </div>):(
                                    <>
                                      <div className="end-headline">{END_COPY[endState].headline(character, endState==="win"&&tags.includes("pressure")&&!tags.includes("open"))}</div>
                                      <div className="end-body">{localizedBody(tags, endState)}</div>
                                      <div className="std-tree-reveal"><TreeReveal key={treeKey} path={pathHistory} killNodeKey={killNode} endState={endState} hideStart={isMobile}/></div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {phase==="question"&&<div className="bp-hspacer"/>}
                      {phase==="question"&&(
                        <div className="bp-row" style={{overflow:"visible", paddingBottom:16}}>
                          <nav className="nav-row" style={{alignItems:"flex-start"}} aria-label="Chat options">
                            <div className="nav-btns" style={{overflow:"visible", gap:24}}>
                              <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={true} onAboutToggle={closeAbout}
                                chatButtons={{ selected, onSelect: selectOption, onConfirm: confirmSelection }}
                              />
                            </div>
                          </nav>
                        </div>
                      )}
                      {phase==="question"&&<div className="bp-hspacer"/>}
                    </>
                  )}

                  {/* Spacer below nav */}
                  {!isChat && <div className="bp-hspacer"/>}

                  {/* Project header + sections — hidden when chat is open */}
                  {!isChat && (<>
                  <div className="bp-row" style={{display:"flex",flexDirection:"row",alignItems:"stretch"}}>
                    <div style={{flex:1,borderRight:"1px solid #000",boxSizing:"border-box"}}/>
                    <div style={{width:"100%",maxWidth:880,padding:"32px 0",flexShrink:0}}>
                      <div className="bc-eyebrow">{p.category}</div>
                      <div style={{fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:700,lineHeight:1.3,textTransform:"uppercase",color:"#000",marginTop:8}}>{p.title}</div>
                      {p.shortDesc && <p style={{fontFamily:'"T-Star Mono",monospace',fontSize:16,fontWeight:300,lineHeight:1.8,color:"rgba(0,0,0,0.6)",marginTop:12}}>{p.shortDesc}</p>}
                    </div>
                    <div style={{flex:1,borderLeft:"1px solid #000",boxSizing:"border-box"}}/>
                  </div>

                  {/* Sections — 880px with side lines, hero images full width */}
                  {p.sections.map((sec, si) => {
                    const isHero = sec.images.length > 0 && sec.images[0].layout === "hero";
                    return (
                      <div key={si}>
                        <div className="bp-hspacer"/>
                        {/* Text — 880px with side lines */}
                        {(sec.label || sec.title || sec.body) && (
                          <div className="bp-row" style={{display:"flex",flexDirection:"row",alignItems:"stretch"}}>
                            <div style={{flex:1,borderRight:"1px solid #000",boxSizing:"border-box"}}/>
                            <div style={{width:"100%",maxWidth:880,padding:"32px 0",flexShrink:0}}>
                              {(sec.label || sec.title) && (
                                <div style={{marginBottom: sec.body || sec.images.length ? 24 : 0}}>
                                  {sec.label && <div className="bc-eyebrow">{sec.label}</div>}
                                  {sec.title && <div style={{fontFamily:'"T-Star Mono",monospace',fontSize:30,fontWeight:700,lineHeight:1.3,textTransform:"uppercase",color:"#000",marginTop:sec.label?8:0}}>{sec.title}</div>}
                                </div>
                              )}
                              {sec.body && <p style={{fontFamily:'"T-Star Mono",monospace',fontSize:16,fontWeight:300,lineHeight:1.8,color:"rgba(0,0,0,0.6)",whiteSpace:"pre-line"}}>{sec.body}</p>}
                            </div>
                            <div style={{flex:1,borderLeft:"1px solid #000",boxSizing:"border-box"}}/>
                          </div>
                        )}
                        {/* Images — hero full width, others with side lines */}
                        {sec.images.length > 0 && (
                          isHero ? (
                            <div className="bp-row">
                              <div style={{width:"100%"}}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={sec.images[0].src} alt={sec.images[0].alt} style={{display:"block",width:"100%",height:"auto",outline:"1px solid #000",boxSizing:"border-box" as const}}/>
                              </div>
                            </div>
                          ) : (
                            <div className="bp-row" style={{display:"flex",flexDirection:"row",alignItems:"stretch"}}>
                              <div style={{flex:1,borderRight:"1px solid #000",boxSizing:"border-box"}}/>
                              <div style={{width:"100%",maxWidth:880,padding:"32px 0",flexShrink:0}}>
                                {(() => {
                                  const imgs = sec.images;
                                  if (imgs[0].layout==="pair-left" && imgs[1]) return (
                                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
                                      {imgs.slice(0,2).map((img,ii)=>(
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img key={ii} src={img.src} alt={img.alt} style={{display:"block",width:"100%",height:"auto",outline:"1px solid #000",boxSizing:"border-box" as const}}/>
                                      ))}
                                    </div>
                                  );
                                  if (imgs[0].layout==="grid3-start") return (
                                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32}}>
                                      {imgs.map((img,ii)=>(
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img key={ii} src={img.src} alt={img.alt} style={{display:"block",width:"100%",height:"auto",outline:"1px solid #000",boxSizing:"border-box" as const}}/>
                                      ))}
                                    </div>
                                  );
                                  // eslint-disable-next-line @next/next/no-img-element
                                  return <img src={imgs[0].src} alt={imgs[0].alt} style={{display:"block",width:"100%",height:"auto",outline:"1px solid #000",boxSizing:"border-box" as const}}/>;
                                })()}
                              </div>
                              <div style={{flex:1,borderLeft:"1px solid #000",boxSizing:"border-box"}}/>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                  </>)}
                  {/* Bottom close row */}
                  {!isChat && <><div className="bp-hspacer"/>
                  <div className="bp-row" style={{overflow:"visible", paddingBottom:16}}>
                    <div className="nav-btns" style={{overflow:"visible", gap:24}}>
                      <div className="brutal-btn-wrap" style={{position:"relative",overflow:"visible",display:"inline-flex"}}>
                        <BrutalShadow>
                          <button className="nav-btn" onClick={closeProject} aria-label="Back"
                            style={{borderRadius:0,border:"1px solid #000",background:"#FFCE00",color:"#000",boxShadow:"none"}}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </BrutalShadow>
                      </div>
                    </div>
                  </div>
                  <div className="bp-hspacer"/></>}

                </div>
                <div className="bp-sr"/>
              </div>
            ) : (
              /* ── DEFAULT OVERLAY ── */
              <div className="proj-overlay-inner">
                {/* Nav repeated so it's visible in the overlay */}
                {/* Nav — hidden when chat is open */}
                {!isChat && (
                <div style={{paddingTop:36}}>
                  {isBrutalist ? (
                    <BrutalShadow>
                      <button className="pill" onClick={closeProject} aria-label="Home">
                        <Wordmark />
                      </button>
                    </BrutalShadow>
                  ) : (
                    <button className="pill" onClick={closeProject} aria-label="Home">
                      <Wordmark />
                    </button>
                  )}
                  <nav className="nav-row" aria-label="Site navigation">
                    <div className="nav-btns">
                      <NavButtons mode={mode} openChat={openChat} setMode={setMode} cycleTheme={cycleTheme} brutal={isBrutalist} onAboutToggle={closeAbout}/>
                    </div>
                    <div className="powered-wrap">
                      <span className="powered">Powered by Claude / AI interaction</span>
                    </div>
                  </nav>
                </div>
                )}

                {/* Chat renders inside overlay, pushes project card down — same as home page */}
                {isChat && (
                  <div className="chat-outer">
                    <div className="chat-card-wrap">
                      <div className={`chat-card`} style={{ background: cardBg, color: cardColor }}>
                        <button className="chat-close" onClick={closeChat} aria-label="Close"><Icon name="close" size={14}/></button>
                        <div className="chat-body">
                          <div className={`chat-indicator${(phase === "processing" || warnBlink) ? " active" : ""}`}>
                            {phase === "processing" ? <Spinner/> : warnBlink ? <WarnBlink/> : null}
                          </div>
                          {phase === "question" && (
                            <>
                              {twTyped[0] !== undefined && (
                                <div className="chat-q" style={{}}>
                                  {twTyped[0]}
                                  {twTyped.length === 1 && !twDone && <span className="tw-cursor"/>}
                                </div>
                              )}
                              <div>
                                {[0,1,2].map(i => {
                                  const lineIdx = i + 1;
                                  const lineText = twTyped[lineIdx];
                                  if (!lineText) return null;
                                  const isActivelyTyping = lineIdx === twTyped.length - 1 && !twDone;
                                  const isSelected = selected === i;
                                  return (
                                    <span key={i} className="chat-opt" onClick={() => selectOption(i as 0|1|2)} style={{cursor:"pointer",display:"block"}}>
                                      {isBinaryQ ? (
                                        <span style={{display:"inline-flex",alignItems:"center",gap:12,color:isSelected?"#fff":undefined}}>
                                          {isSelected && <span>&gt;&nbsp;</span>}
                                          {BINARY_ICONS[i]}
                                        </span>
                                      ) : isSelected ? <span style={{color:"#fff"}}>&gt; {lineText}</span> : lineText}
                                      {isActivelyTyping && !isBinaryQ && <span className="tw-cursor"/>}
                                    </span>
                                  );
                                })}
                              </div>
                            </>
                          )}
                          {phase === "processing" && showQuip && quip && <QuipTyper text={quip} />}
                          {phase === "done" && endState && (
                            <>
                              {showFreeform ? (<div style={{paddingBottom:8}}>
                                <div style={{opacity:0.6,fontSize:16,marginBottom:12,fontFamily:'"T-Star Mono",monospace'}}>{ locale === 'ja' ? JA.cta_more : 'Anything further to add?' }</div>
                                <div className="chat-input-row" style={{margin:0}}>
                                  <input className="chat-input" placeholder="..." aria-label="Open message" autoFocus/>
                                  <button className="chat-input-send" aria-label="Send"><ArrowRight size={20}/></button>
                                </div>
                                <button onClick={()=>setShowFreeform(false)} style={{marginTop:12,background:"none",border:"none",color:"rgba(0,0,0,0.5)",fontFamily:'"T-Star Mono",monospace',fontSize:13,cursor:"pointer",padding:0}}>← back</button>
                              </div>) : (
                                <>
                                  <div className="end-headline">{END_COPY[endState].headline(character, endState==="win"&&tags.includes("pressure")&&!tags.includes("open"))}</div>
                                  <div className="end-body">{localizedBody(tags, endState)}</div>
                                  <div className="std-tree-reveal"><TreeReveal key={treeKey} path={pathHistory} killNodeKey={killNode} endState={endState} hideStart={isMobile}/></div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {phase !== "done" && (
                        phase === "processing" ? (
                          <div className="chat-input-row">
                            <input className="chat-input" placeholder="octopus" aria-label="Free response" autoFocus/>
                            <button className="chat-input-send" aria-label="Send"><ArrowRight size={20}/></button>
                          </div>
                        ) : (
                          <div className="btn-row">
                            {([0,1,2] as const).map(i => {
                              let c = "abc";
                              if (selected !== null) c += selected === i ? " on" : " dim";
                              return <button key={i} className={c} onClick={() => selectOption(i)} aria-label={`Option ${String.fromCharCode(65+i)}`}>{String.fromCharCode(65+i)}</button>;
                            })}
                            <button className={`go${selected !== null ? " ready" : ""}`} onClick={selected !== null ? confirmSelection : undefined} aria-label="Confirm"><ArrowRight size={22}/></button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* ── CARD — default or split-gradient ── */}
                {p.cardStyle === "split-gradient" ? (
                  // Two joined half-cards
                  <div className={`proj-card-wrap ${projectClosing ? "proj-card-out" : "proj-card-in"}`}>
                    {/* TOP half-card */}
                    <div style={{
                      background: p.cardBg ?? "#f3f3f7",
                      borderRadius:"32px 32px 0 0",
                      padding:"360px 32px 32px",
                      display:"flex", flexDirection:"column", alignItems:"center",
                      position:"relative",
                      overflow:"hidden",
                    }}>
                      {/* Background peek image */}
                      {p.cardBgImage && (
                        <div style={{
                          position:"absolute", top:0, left:0, right:0, bottom:0,
                          backgroundImage:`url(${p.cardBgImage})`,
                          backgroundSize:"contain",
                          backgroundPosition:"top center",
                          backgroundRepeat:"no-repeat",
                          pointerEvents:"none",
                          zIndex:0,
                        }}/>
                      )}
                      {/* ✓ close top — centered, not absolute */}
                      <button onClick={closeProject} aria-label="Back to all work" style={{
                        width:36,height:36,borderRadius:"50%",
                        background:"#fff",border:"none",color:"#111",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        cursor:"pointer",zIndex:2,alignSelf:"center",
                        boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
                        marginBottom:16, position:"relative",
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <div style={{position:"relative",zIndex:1,width:"100%"}}>
                        <SectionsList
                          sections={p.sections}
                          onOpen={(src,alt) => {/* lightbox not accessible here — handled in ProjectContent */}}
                          filter={s => !s.splitBottom}
                        />
                      </div>
                    </div>
                    {/* BOTTOM half-card */}
                    <div style={{
                      background: p.cardBg2 ?? "#f3f3f7",
                      borderRadius:"0 0 32px 32px",
                      padding:32,
                      display:"flex", flexDirection:"column", alignItems:"center",
                    }}>
                      <SectionsList
                        sections={p.sections}
                        onOpen={(src,alt) => {/* lightbox */}}
                        filter={s => !!s.splitBottom}
                      />
                      {/* ✓ close bottom */}
                      <button className="proj-close-btn" onClick={closeProject} aria-label="Back to all work" style={{marginTop:32}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : isBrutalist ? (
                  // ── BRUTAL PROJECT OVERLAY ────────────────────────────────
                  <div className="bp-outer" style={{marginTop:0}}>
                    <div className="bp-sl"/>
                    <div className="bp-col" style={{paddingTop:0}}>

                      {/* Back / close row */}
                      <div className="bp-row" style={{overflow:"visible", paddingBottom:16}}>
                        <div className="nav-row" style={{alignItems:"flex-start"}}>
                          <div className="nav-btns" style={{overflow:"visible", gap:24}}>
                            <div className="brutal-btn-wrap" style={{position:"relative",overflow:"visible",display:"inline-flex"}}>
                              <BrutalShadow>
                                <button className="nav-btn" onClick={closeProject} aria-label="Back"
                                  style={{borderRadius:0,border:"1px solid #000",background:"#FFCE00",color:"#000",boxShadow:"none"}}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </BrutalShadow>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project header — eyebrow + title */}
                      <div className="bp-hspacer"/>
                      <div className="bp-row">
                        <div style={{padding:"32px 0"}}>
                          <div className="bc-eyebrow">{p.category}</div>
                          <div style={{
                            fontFamily:'"T-Star Mono",monospace',
                            fontSize:30,fontWeight:700,lineHeight:1.3,
                            textTransform:"uppercase",color:"#000",
                            marginTop:8,
                          }}>{p.title}</div>
                          {p.shortDesc && (
                            <p style={{
                              fontFamily:'"T-Star Mono",monospace',
                              fontSize:16,fontWeight:300,lineHeight:1.8,
                              color:"rgba(0,0,0,0.6)",marginTop:12,
                            }}>{p.shortDesc}</p>
                          )}
                        </div>
                      </div>

                      {/* Sections */}
                      {p.sections.map((sec, si) => (
                        <div key={si}>
                          <div className="bp-hspacer"/>
                          <div className="bp-row">
                            <div style={{padding:"32px 0", width:"100%"}}>
                              {(sec.label || sec.title) && (
                                <div style={{marginBottom: sec.body || sec.images.length ? 24 : 0}}>
                                  {sec.label && (
                                    <div className="bc-eyebrow">{sec.label}</div>
                                  )}
                                  {sec.title && (
                                    <div style={{
                                      fontFamily:'"T-Star Mono",monospace',
                                      fontSize:30,fontWeight:700,lineHeight:1.3,
                                      textTransform:"uppercase",color:"#000",
                                      marginTop: sec.label ? 8 : 0,
                                    }}>{sec.title}</div>
                                  )}
                                </div>
                              )}
                              {sec.body && (
                                <p style={{
                                  fontFamily:'"T-Star Mono",monospace',
                                  fontSize:16,fontWeight:300,lineHeight:1.8,
                                  color:"rgba(0,0,0,0.6)",
                                  whiteSpace:"pre-line",
                                  marginBottom: sec.images.length ? 32 : 0,
                                }}>{sec.body}</p>
                              )}
                              {/* Images */}
                              {sec.images.length > 0 && (() => {
                                const imgs = sec.images;
                                if (imgs[0].layout === "pair-left" && imgs[1]) {
                                  return (
                                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
                                      {imgs.slice(0,2).map((img,ii) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img key={ii} src={img.src} alt={img.alt}
                                          style={{display:"block",width:"100%",height:"auto",
                                            border:"1px solid #000",boxSizing:"border-box"}}/>
                                      ))}
                                    </div>
                                  );
                                }
                                if (imgs[0].layout === "grid3-start") {
                                  return (
                                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:32}}>
                                      {imgs.map((img,ii) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img key={ii} src={img.src} alt={img.alt}
                                          style={{display:"block",width:"100%",height:"auto",
                                            border:"1px solid #000",boxSizing:"border-box"}}/>
                                      ))}
                                    </div>
                                  );
                                }
                                // single / hero / editorial
                                return (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={imgs[0].src} alt={imgs[0].alt}
                                    style={{display:"block",width:"100%",height:"auto",
                                      border:"1px solid #000",boxSizing:"border-box"}}/>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Bottom spacer + close */}
                      <div className="bp-hspacer"/>
                      <div className="bp-row" style={{overflow:"visible", paddingBottom:16}}>
                        <div className="nav-row" style={{alignItems:"flex-start"}}>
                          <div className="nav-btns" style={{overflow:"visible",gap:24}}>
                            <div className="brutal-btn-wrap" style={{position:"relative",overflow:"visible",display:"inline-flex"}}>
                              <BrutalShadow>
                                <button className="nav-btn" onClick={closeProject} aria-label="Back"
                                  style={{borderRadius:0,border:"1px solid #000",background:"#FFCE00",color:"#000",boxShadow:"none"}}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </BrutalShadow>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bp-hspacer"/>

                    </div>
                    <div className="bp-sr"/>
                  </div>
                ) : (
                  // Default single card
                  <div className={`proj-card ${projectClosing ? "proj-card-out" : "proj-card-in"}`}
                    style={{ background: dark ? "#111" : p.thumbBg, display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <button className="proj-close-btn" onClick={closeProject} aria-label="Back to all work">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M21.4727 5.4668C21.767 5.1757 22.2419 5.1785 22.5332 5.47266C22.8243 5.76698 22.8215 6.24185 22.5274 6.5332L9.7549 19.1846C9.26773 19.6671 8.4823 19.6671 7.99513 19.1846L1.47267 12.7236C1.1785 12.4323 1.17569 11.9574 1.46681 11.6631C1.75816 11.3689 2.23303 11.3662 2.52736 11.6572L8.87404 17.9434L21.4727 5.4668Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <div style={{ width:"100%", maxWidth:880, margin:"0 auto" }}>
                      <span style={{
                        fontSize:16,letterSpacing:".14em",textTransform:"uppercase",
                        fontWeight:700,color:dark?"rgba(255,255,255,0.5)":"rgba(0,0,0,0.5)",
                        fontFamily:'"T-Star Mono",monospace',
                        paddingBottom:6,borderBottom:`1px solid ${dark?"rgba(255,255,255,0.15)":"rgba(0,0,0,0.12)"}`,
                        display:"inline-block",marginBottom:8,
                      }}>{p.category}</span>
                      <h1 style={{
                        fontSize:30,fontWeight:700,lineHeight:1.2,letterSpacing:"-.01em",
                        fontFamily:'"T-Star Mono",monospace',
                        color:dark?"#fff":"#111",marginBottom:12,
                      }}>{p.title}</h1>
                      <p style={{
                        fontSize:16,lineHeight:1.8,
                        color:dark?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.6)",
                        fontWeight:400,fontFamily:'"T-Star Mono",monospace',
                      }}>{p.shortDesc}</p>
                    </div>
                    <ProjectContent project={p} />
                    <div style={{height:32}}/>
                  </div>
                )}
              </div>
            )} 
          </div>
          );
        })()}
    </div>
  );
}
