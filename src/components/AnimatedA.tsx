"use client";

import { useEffect, useRef, useState } from "react";

const GROW    = 2240;
const SPAWN   = 1120;
const LIFE    = GROW + SPAWN + 1;
const YELLOW  = "#FFD132";
const BLACK   = "#000000";
const CLIP    = "polygon(50% 0%, 100% 100%, 0% 100%)";
// Centroid of an equilateral-ish triangle = 1/3 up from base
// viewBox height=32, so centroid Y = 32 - 32/3 ≈ 21.33
const TRANSFORM_ORIGIN = "50% 66.66%";

function easeOutCubic(x: number) {
  return x * x * x; // easeIn — slow start keeps the new particle visibly small longer
}

interface AnimatedAProps {
  size?: number;
}

export default function AnimatedA({ size = 37 }: AnimatedAProps) {
  const h            = Math.round(size * 32 / 37);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const container = containerRef.current!;
    const particles: { el: HTMLDivElement; bornAt: number }[] = [];
    let nextColor   = YELLOW;
    let lastSpawnAt = -Infinity;

    function spawn(now: number) {
      const color = nextColor;
      nextColor   = color === YELLOW ? BLACK : YELLOW;
      const el    = document.createElement("div");
      el.style.cssText = `position:absolute;inset:0;background:${color};clip-path:${CLIP};transform:scale(0);transform-origin:${TRANSFORM_ORIGIN};`;
      container.appendChild(el);
      particles.push({ el, bornAt: now });
      lastSpawnAt = now;
    }

    // Seed mid-stream: yellow at 100% (just finished), black at 50% (halfway)
    const now = performance.now();
    spawn(now - GROW);           // yellow, age=900 → scale=1, survives SPAWN+1ms more
    spawn(now - GROW + SPAWN);   // black,  age=450 → scale~88%, fires next spawn soon

    function tick(ts: number) {
      // Spawn on fixed 450ms interval
      if (ts - lastSpawnAt >= SPAWN) {
        spawn(ts);
      }

      // Update + prune
      for (let i = particles.length - 1; i >= 0; i--) {
        const p   = particles[i];
        const age = ts - p.bornAt;
        if (age >= LIFE) {
          container.removeChild(p.el);
          particles.splice(i, 1);
          continue;
        }
        const s = easeOutCubic(Math.min(age / GROW, 1));
        p.el.style.transform = `scale(${s})`;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      for (const p of [...particles]) {
        if (p.el.parentNode === container) container.removeChild(p.el);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [running]);

  return (
    <div
      ref={containerRef}
      onClick={() => setRunning(r => !r)}
      style={{ position: "relative", width: size, height: h, cursor: "pointer", flexShrink: 0 }}
    />
  );
}
