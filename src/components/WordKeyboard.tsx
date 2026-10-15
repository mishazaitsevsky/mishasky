"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const shadow = "4px 4px 16px rgba(0,0,0,0.16)";
const font: React.CSSProperties = {
  fontFamily: '"T-Star Mono",monospace',
  fontWeight: 700,
  fontSize: 15,
  lineHeight: "16px",
};

// ── Key ───────────────────────────────────────────────────────────────────────
type KeyVariant = "yellow" | "yellow-bold" | "blue" | "blue-rect" | "action";

function Key({ label, variant = "yellow", onClick, icon, flex }: {
  label: string; variant?: KeyVariant;
  onClick: () => void; icon?: React.ReactNode; flex?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isBlue = variant === "blue" || variant === "blue-rect";
  const bg    = hovered ? (isBlue ? "#FFD132" : "#007AD5") : (isBlue ? "#007AD5" : "#FFD132");
  const color = hovered ? (isBlue ? "#000"    : "#fff")    : (isBlue ? "#fff"    : "#000");
  return (
    <div style={{
      ...font, display:"inline-flex", alignItems:"center",
      justifyContent: variant === "action" ? "flex-end" : "center",
      gap:8, height:40, padding:"0 16px",
      borderRadius: variant === "blue-rect" ? 20 : 100,
      border:"1px solid rgba(255,255,255,0.9)",
      cursor:"pointer", boxShadow: variant === "yellow-bold" ? "4px 4px 16px rgba(0,0,0,0.24)" : shadow,
      flexShrink: flex ? 1 : 0,
      flex: flex ? 1 : undefined,
      whiteSpace:"nowrap" as const, userSelect:"none" as const,
      transition:"background 0.12s, color 0.12s", background:bg, color,
    }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}{icon}
    </div>
  );
}

function Chevron() {
  return (
    <svg width="13" height="7" viewBox="0 0 13 7" fill="none" style={{flexShrink:0}}>
      <path d="M1 1L6.5 6L12 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none" style={{flexShrink:0}}>
      <path d="M14 6.5L1 6.5M8.5 1L14 6.5L8.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
function DropdownItem({ label, onSelect }: { label: string; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      ...font, fontWeight:400,
      background: hovered ? "#007AD5" : "#fff",
      color: hovered ? "#fff" : "#000",
      borderRadius:100, padding:"0 12px", height:40,
      display:"inline-flex", alignItems:"center",
      cursor:"pointer", flexShrink:0,
      border:"1px solid rgba(255,255,255,0.9)",
      transition:"background 0.12s, color 0.12s",
    }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </div>
  );
}

function Dropdown({ items, onSelect }: { items: string[]; onSelect: (w: string) => void }) {
  return (
    <div style={{display:"flex", justifyContent:"flex-end", width:"100%"}}>
      <div style={{
        display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"flex-end", gap:4,
        background:"#fff", borderRadius:24,
        border:"1px solid rgba(255,255,255,0.9)",
        boxShadow:shadow, padding:"0 8px",
      }}>
        {items.map(item => (
          <DropdownItem key={item} label={item} onSelect={() => onSelect(item)}/>
        ))}
      </div>
    </div>
  );
}

// ── Overflow row ──────────────────────────────────────────────────────────────
// Measures available width, shows as many buttons as fit, spills rest into dropdown.
// RIGHT side = [dropdown?] [action] — always reserved.
// LEFT side  = word buttons, truncated to fit.
const ACTION_W  = 96;  // approx width of delete/return button
const DROPDOWN_W = 96; // approx width of more/topic button
const GAP        = 8;

function OverflowRow({
  words, onWord, wordVariants,
  extraItems, extraLabel, extraVariant,
  actionLabel, actionVariant, actionIcon, onAction,
}: {
  words: string[];
  onWord: (w: string) => void;
  wordVariants?: Record<string, KeyVariant>;
  extraItems: string[];
  extraLabel: string;
  extraVariant: KeyVariant;
  actionLabel: string;
  actionVariant: KeyVariant;
  actionIcon: React.ReactNode;
  onAction: () => void;
}) {
  const rowRef  = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(words.length);
  const [dropOpen, setDropOpen]         = useState(false);

  // Estimate button width: padding 32px + ~10px per char
  const estimateW = (label: string) => 32 + label.length * 10;

  const recalc = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const available = el.offsetWidth;
    // Reserve space for action button + gap
    let reserved = ACTION_W + GAP;
    // Try to fit word buttons left to right
    let used = 0;
    let count = 0;
    for (let i = 0; i < words.length; i++) {
      const w = estimateW(words[i]) + GAP;
      // Check if we need to add dropdown button too
      const needsDropdown = i < words.length - 1 || extraItems.length > 0;
      const extra = needsDropdown ? DROPDOWN_W + GAP : 0;
      if (used + w + reserved + extra > available) break;
      used += w;
      count++;
    }
    setVisibleCount(Math.max(1, count));
  }, [words, extraItems.length]);

  useEffect(() => {
    recalc();
    const observer = new ResizeObserver(recalc);
    if (rowRef.current) observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, [recalc]);

  const visible  = words.slice(0, visibleCount);
  const overflow = words.slice(visibleCount);
  const allExtra = [...overflow, ...extraItems];

  return (
    <div style={{display:"flex", flexDirection:"column", gap:16}}>
      <div ref={rowRef} style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:GAP}}>
        {/* Left: visible word buttons — fill available space */}
        <div style={{display:"flex", alignItems:"center", gap:GAP, flex:1}}>
          {visible.map(w => (
            <Key key={w} label={w} variant={wordVariants?.[w] ?? "yellow"} onClick={() => onWord(w)} flex/>
          ))}
        </div>
        {/* Right: dropdown (if needed) + action */}
        <div style={{display:"flex", alignItems:"center", gap:GAP, flexShrink:0}}>
          {allExtra.length > 0 && (
            <Key
              label={extraLabel} variant={extraVariant}
              icon={<Chevron/>}
              onClick={() => setDropOpen(o => !o)}
            />
          )}
          <Key label={actionLabel} variant={actionVariant} icon={actionIcon} onClick={onAction}/>
        </div>
      </div>
      {dropOpen && allExtra.length > 0 && (
        <Dropdown items={allExtra} onSelect={w => { onWord(w); setDropOpen(false); }}/>
      )}
    </div>
  );
}

// ── WordKeyboard ──────────────────────────────────────────────────────────────
interface WordKeyboardProps {
  onWord: (word: string) => void;
  onDelete: () => void;
  onReturn: () => void;
}

export default function WordKeyboard({ onWord, onDelete, onReturn }: WordKeyboardProps) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap:16, width:"100%"}}>
      <OverflowRow
        words={["What","Who","Can","Why","How"]}
        onWord={onWord}
        wordVariants={{ Why: "yellow-bold" }}
        extraItems={["Do","Did","Where","When","Not","will"]}
        extraLabel="more"
        extraVariant="blue"
        actionLabel="delete"
        actionVariant="action"
        actionIcon={<CloseIcon/>}
        onAction={onDelete}
      />
      <OverflowRow
        words={["You","Your","Work","Make","Use"]}
        onWord={onWord}
        wordVariants={{ You: "yellow-bold", Make: "yellow-bold" }}
        extraItems={["Ai","Site","Code","Money","Game","Future","Standard","Nirvana"]}
        extraLabel="topic"
        extraVariant="blue-rect"
        actionLabel="return"
        actionVariant="action"
        actionIcon={<ArrowRight/>}
        onAction={onReturn}
      />
    </div>
  );
}
