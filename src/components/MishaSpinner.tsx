"use client";

/**
 * MishaSpinner — animated MiSH∆ wordmark used as a loader.
 *
 * Each letter has its own morph animation, all running simultaneously.
 * Beat = 560ms (matches JUMP_DURATION). Full cycle = 2 beats = 1120ms.
 *
 * M  — slot-reel: clip window scrolls through [M → ▽ → M] vertically
 * i  — dot drops onto stem (squash), bounces back up
 * S  — top/bottom halves swap positions (translateY), return
 * H  — 4 outer squares orbit clockwise around fixed center square
 * ∆  — fill cycles: outlined (black/yellow) → solid yellow → back
 */

import { useEffect, useRef } from "react";

const BEAT     = 560;   // ms — one beat, matches jump duration
const CYCLE    = BEAT * 2; // full out-and-back = 1120ms
const COLOR    = "#ffffff"; // default white; override via prop
const EASE     = "cubic-bezier(0.4, 0, 0.2, 1)";

// ── Letter dimensions (match WordmarkFixed exactly) ───────────────────────────
const M_W = 38; const M_H = 32;
const I_W =  9; const I_H = 32;
const S_W = 16; const S_H = 32;
const H_W = 32; const H_H = 32; const H_CELL = 10.667;
const D_W = 37; const D_H = 32;

// ── SpinnerM ──────────────────────────────────────────────────────────────────
// Clip window = letter bounding box. Reel = [M, ▽, M] stacked, each M_H tall.
// Animate translateY on reel: 0 → -M_H (triangle in) → -M_H*2 (M back, same as 0 after wrap).
// Using two-segment animation: 0→-M_H over BEAT, then -M_H→-M_H*2 over BEAT.
function SpinnerM({ color, running }: { color: string; running: boolean }) {
  const reelRef = useRef<SVGGElement>(null);
  useEffect(() => {
    const el = reelRef.current;
    if (!el) return;
    if (!running) {
      el.getAnimations().forEach(a => a.cancel());
      el.style.transform = "";
      return;
    }
    el.animate([
      { transform: `translateY(${-M_H*2}px)`, easing: EASE, offset: 0   }, // M → ▽ with full curve
      { transform: `translateY(${-M_H}px)`,   easing: EASE, offset: 0.5 }, // ▽ → M with full curve
      { transform: `translateY(0px)`,                        offset: 1   }, // M seamless wrap
    ], { duration: CYCLE * 2, easing: "linear", iterations: Infinity });
  }, [running]);

  // Triangle path — full width (0 to 38), flat top, point at bottom center
  // Matches M's visual width exactly, no gap (starts at y=0)
  const tri = `M0 0H38L19 32Z`;
  // M paths (from original SVG)
  const mP1 = "M32.5562 27.5H26.3755L32.5562 16.793V27.5Z";
  const mP2 = "M4.49951 27.5H10.6802L4.49951 16.793V27.5Z";

  return (
    <svg width={M_W} height={M_H} viewBox={`0 0 ${M_W} ${M_H}`} fill="none"
      style={{overflow:"hidden"}}>
      <defs>
        <clipPath id="clip-m">
          <rect width={M_W} height={M_H}/>
        </clipPath>
      </defs>
      <g clipPath="url(#clip-m)">
        <g ref={reelRef} style={{transform:`translateY(${-M_H*2}px)`}}>
          {/* Frame -2: M (pre-load, above clip) */}
          <g transform={`translate(0, 0)`}>
            <path d={mP1} fill={color} stroke={color} strokeWidth="9"/>
            <path d={mP2} fill={color} stroke={color} strokeWidth="9"/>
          </g>
          {/* Frame -1: triangle (above clip at start) */}
          <g transform={`translate(0, ${M_H})`}>
            <path d={tri} fill={color}/>
          </g>
          {/* Frame 0: M default — visible at rest */}
          <g transform={`translate(0, ${M_H * 2})`}>
            <path d={mP1} fill={color} stroke={color} strokeWidth="9"/>
            <path d={mP2} fill={color} stroke={color} strokeWidth="9"/>
          </g>
        </g>
      </g>
    </svg>
  );
}

// ── SpinnerI ──────────────────────────────────────────────────────────────────
// Dot (circle, r=4.459, cy=4.459) falls to cy≈26 (lands on stem top at y=12.59),
// squashes (scaleY), then bounces back up.
function SpinnerI({ color, running }: { color: string; running: boolean }) {
  const dotRef = useRef<SVGCircleElement>(null);
  const DOT_R    = 4.459;
  const DOT_REST = DOT_R;           // cy at rest
  const STEM_TOP = 12.59;           // top of stem
  const DOT_LAND = STEM_TOP - DOT_R; // cy when landed (just touching stem)

  useEffect(() => {
    const el = dotRef.current;
    if (!el) return;
    if (!running) {
      el.getAnimations().forEach(a => a.cancel());
      return;
    }
    el.animate([
      { cy: `${DOT_REST}`,  transform: "scaleY(1)",    offset: 0    },
      { cy: `${DOT_LAND}`,  transform: "scaleY(1)",    offset: 0.42 }, // falling
      { cy: `${DOT_LAND}`,  transform: "scaleY(0.55)", offset: 0.5  }, // squash on land
      { cy: `${DOT_LAND}`,  transform: "scaleY(1)",    offset: 0.58 }, // release
      { cy: `${DOT_REST}`,  transform: "scaleY(1)",    offset: 1    }, // back up
    ], { duration: CYCLE, easing: EASE, iterations: Infinity });
  }, [running, DOT_REST, DOT_LAND]);

  return (
    <svg width={I_W} height={I_H} viewBox={`0 0 ${I_W} ${I_H}`} fill="none">
      {/* Stem — static */}
      <rect y="12.59" width="8.918" height="19.41" fill={color}/>
      {/* Dot — animated */}
      <circle ref={dotRef} cx="4.459" cy={DOT_REST} r={DOT_R}
        fill={color} style={{transformOrigin:"4.459px 12.59px"}}/>
    </svg>
  );
}

// ── SpinnerS ──────────────────────────────────────────────────────────────────
// Top half translates down by S_H/2, bottom half translates up by S_H/2.
// They swap, hold, then return.
function SpinnerS({ color, running }: { color: string; running: boolean }) {
  const topRef = useRef<SVGGElement>(null);
  const botRef = useRef<SVGGElement>(null);
  const SHIFT = S_H / 2; // 16px

  useEffect(() => {
    const top = topRef.current;
    const bot = botRef.current;
    if (!top || !bot) return;
    if (!running) {
      [top, bot].forEach(el => { el.getAnimations().forEach(a => a.cancel()); el.style.transform = ""; });
      return;
    }
    // Each switch is its own full cycle — like M's slot reel.
    // state1(0) → state2(0.5) → state1(1), each half has its own ease-in-out.
    const kf: Keyframe[] = [
      { transform: "translateY(0px)",         offset: 0,   easing: EASE },
      { transform: `translateY(${SHIFT}px)`,  offset: 0.5, easing: EASE },
      { transform: "translateY(0px)",         offset: 1                  },
    ];
    const kfBot: Keyframe[] = [
      { transform: "translateY(0px)",          offset: 0,   easing: EASE },
      { transform: `translateY(${-SHIFT}px)`,  offset: 0.5, easing: EASE },
      { transform: "translateY(0px)",          offset: 1                  },
    ];
    const opts: KeyframeAnimationOptions = {
      duration: CYCLE * 2,
      easing: "linear", // per-keyframe easing handles the curve
      iterations: Infinity,
      direction: "normal",
    };
    top.animate(kf, opts);
    bot.animate(kfBot, opts);
  }, [running, SHIFT]);

  return (
    <svg width={S_W} height={S_H} viewBox={`0 0 ${S_W} ${S_H}`} fill="none">
      {/* Top half */}
      <g ref={topRef}>
        <path d="M0 8C0 12.418 3.582 16 8 16V0C3.582 0 0 3.582 0 8Z" fill={color}/>
      </g>
      {/* Bottom half */}
      <g ref={botRef}>
        <path d="M15.724 24C15.724 19.582 12.142 16 7.724 16L7.724 32C12.142 32 15.724 28.418 15.724 24Z" fill={color}/>
      </g>
    </svg>
  );
}

// ── SpinnerH ──────────────────────────────────────────────────────────────────
// 5 squares on a 3×3 grid (cell = 10.667px). Center fixed.
// 4 corners orbit clockwise simultaneously.
// TL(0,0)→TR(21.334,0)→BR(21.334,21.334)→BL(0,21.334)→TL
// Full revolution = one BEAT (half cycle of other letters).
function SpinnerH({ color, running }: { color: string; running: boolean }) {
  const C = H_CELL;
  const refs = [
    useRef<SVGRectElement>(null), // TL
    useRef<SVGRectElement>(null), // TR
    useRef<SVGRectElement>(null), // BR
    useRef<SVGRectElement>(null), // BL
  ];

  // Clockwise positions: TL→TR→BR→BL→TL
  // Each corner starts one step ahead
  const positions = [
    [{ x:0,   y:0   }, { x:C*2, y:0   }, { x:C*2, y:C*2 }, { x:0,   y:C*2 }, { x:0,   y:0   }], // TL
    [{ x:C*2, y:0   }, { x:C*2, y:C*2 }, { x:0,   y:C*2 }, { x:0,   y:0   }, { x:C*2, y:0   }], // TR
    [{ x:C*2, y:C*2 }, { x:0,   y:C*2 }, { x:0,   y:0   }, { x:C*2, y:0   }, { x:C*2, y:C*2 }], // BR
    [{ x:0,   y:C*2 }, { x:0,   y:0   }, { x:C*2, y:0   }, { x:C*2, y:C*2 }, { x:0,   y:C*2 }], // BL
  ];

  useEffect(() => {
    refs.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      if (!running) { el.getAnimations().forEach(a => a.cancel()); return; }
      const pos = positions[i];
      // Each square moves one quarter clockwise per cycle — end state = start state visually
      const from = positions[i][0];
      const to   = positions[i][1];
      el.animate([
        { transform: `translate(${from.x}px, ${from.y}px)`, offset: 0 },
        { transform: `translate(${to.x}px,   ${to.y}px)`,   offset: 1 },
      ], {
        duration: CYCLE,
        easing: EASE,
        iterations: Infinity,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <svg width={H_W} height={H_H} viewBox={`0 0 ${H_W} ${H_H}`} fill="none">
      {/* Center square — fixed */}
      <rect x={C} y={C} width={C} height={C} fill={color}/>
      {/* 4 orbiting corners */}
      {refs.map((ref, i) => (
        <rect
          key={i}
          ref={ref}
          width={C} height={C}
          fill={color}
          style={{transform: `translate(${positions[i][0].x}px, ${positions[i][0].y}px)`}}
        />
      ))}
    </svg>
  );
}

// ── SpinnerDelta ──────────────────────────────────────────────────────────────
// Particle emitter: spawns a new triangle every SPAWN ms, each scales 0→1
// over GROW ms, lives for GROW+SPAWN+1 ms (so it's always covered before removal).
function SpinnerDelta({ running }: { running: boolean }) {
  const svgRef     = useRef<SVGSVGElement>(null);
  const rafRef     = useRef<number | null>(null);
  const runningRef = useRef(running);
  useEffect(() => { runningRef.current = running; }, [running]);

  const GROW   = 2240;
  const SPAWN  = 1120;
  const LIFE   = GROW + SPAWN + 1;
  const TRI    = "M18.475 0L36.95 32H0Z";
  const ORIG   = "18.475px 21.33px";
  const YELLOW = "#FFD132";
  const BLACK  = "#000000";
  const easeIn = (x: number) => x * x * x;

  useEffect(() => {
    const svg = svgRef.current!;
    const particles: { el: SVGGElement; bornAt: number }[] = [];
    let nextColor   = BLACK;
    let nextSpawnAt = 0;

    function addParticle(bornAt: number) {
      const color = nextColor;
      nextColor = color === YELLOW ? BLACK : YELLOW;
      const g    = document.createElementNS("http://www.w3.org/2000/svg", "g");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", TRI);
      path.setAttribute("fill", color);
      g.style.transformOrigin = ORIG;
      g.style.transform = "scale(0)";
      g.appendChild(path);
      svg.appendChild(g);
      particles.push({ el: g, bornAt });
    }

    // Seed: black=scale(1), yellow=scale(≈0.5)
    const now     = performance.now();
    const halfAge = Math.cbrt(0.5) * GROW;
    addParticle(now - GROW);
    addParticle(now - halfAge);
    // Next spawn: advance past all overdue intervals from yellow's birth
    nextSpawnAt = now - halfAge + SPAWN;
    while (nextSpawnAt <= now) nextSpawnAt += SPAWN;

    // Paint seeds right away
    for (const p of particles) {
      p.el.style.transform = `scale(${easeIn(Math.min((now - p.bornAt) / GROW, 1))})`;
    }

    function tick(ts: number) {
      if (!runningRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      while (ts >= nextSpawnAt) {
        addParticle(nextSpawnAt);
        nextSpawnAt += SPAWN;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p   = particles[i];
        const age = ts - p.bornAt;
        if (age >= LIFE) {
          svg.removeChild(p.el);
          particles.splice(i, 1);
          continue;
        }
        p.el.style.transform = `scale(${easeIn(Math.min(age / GROW, 1))})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      for (const p of [...particles]) {
        if (p.el.parentNode === svg) svg.removeChild(p.el);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <svg ref={svgRef} width={D_W} height={D_H} viewBox={`0 0 ${D_W} ${D_H}`} fill="none"/>;
}

// ── MishaSpinner ──────────────────────────────────────────────────────────────
interface MishaSpinnerProps {
  running?: boolean;
  color?: string;
  size?: number; // scale factor, default 1
}

export default function MishaSpinner({ running = true, color = COLOR, size = 1 }: MishaSpinnerProps) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6 * size,
      transform: size !== 1 ? `scale(${size})` : undefined,
      transformOrigin: "left center",
    }}>
      <SpinnerM     color={color} running={running}/>
      <SpinnerI     color={color} running={running}/>
      <SpinnerS     color={color} running={running}/>
      <SpinnerH     color={color} running={running}/>
      <SpinnerDelta running={running}/>
    </span>
  );
}
