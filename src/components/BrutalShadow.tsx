"use client";
import { useState, useRef, useEffect } from "react";

const S = 16;
const DUR = 150;
const EASE = "cubic-bezier(0.25,0.46,0.45,0.94)";

export default function BrutalShadow({ children, block, pressed, noHover, shadowColor = "#000", animateOnMount = false, mountDelay = 0 }: {
  children: React.ReactNode;
  block?: boolean;
  pressed?: boolean;
  noHover?: boolean;
  shadowColor?: string;
  animateOnMount?: boolean;
  mountDelay?: number;
}) {
  const [state, setState] = useState<"up"|"down">("up");
  // snap=true means no transition this frame (used to set start position instantly)
  const [snap, setSnap] = useState(false);
  const prevPressed = useRef(pressed);

  // On-mount rise animation: snap to down, then animate up after mountDelay
  useEffect(() => {
    if (!animateOnMount) return;
    const t = setTimeout(() => {
      setSnap(true);
      setState("down");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSnap(false);
        setState("up");
      }));
    }, mountDelay);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevPressed.current === true && pressed === false) {
      // pressed→false: snap to down instantly (no transition), then animate to up
      setSnap(true);
      setState("down");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSnap(false);
          setState("up");
        });
      });
    }
    prevPressed.current = pressed;
  }, [pressed]);

  const press   = () => { setSnap(false); setState("down"); };
  const release = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => setState("up")));
  };

  const handlers = (!pressed && !noHover) ? {
    onMouseDown:  press,
    onMouseUp:    release,
    onMouseLeave: release,
  } : {};

  const isDown = pressed || state === "down";
  const offset = isDown ? S : 0;
  const op = 1; // always visible — clip-path handles hiding, no opacity needed
  const clip = (pressed && state === "up" && !snap)
    ? `inset(0px ${S}px ${S}px 0px)`  // static pressed: fully clipped
    : state === "down"
      ? `inset(0px ${S}px ${S}px 0px)` // animating down
      : `inset(0px 0px 0px 0px)`;       // up: fully visible
  const T = snap ? `0ms` : `${DUR}ms ${EASE}`;

  return (
    <div
      style={{
        position:"relative",
        display: block ? "block" : "inline-block",
        width: block ? "100%" : undefined,
        overflow:"visible",
      }}
      {...handlers}
    >
      <div style={{
        position:"relative", zIndex:2, pointerEvents:"auto",
        transform: `translate(${offset}px, ${offset}px)`,
        transition: `transform ${T}`,
      }}>
        {children}
        <div style={{
          position:"absolute",
          top:0, left:0,
          width:`calc(100% + ${S}px)`,
          height:`calc(100% + ${S}px)`,
          overflow:"hidden",
          zIndex:-1, pointerEvents:"none",
          opacity: op,
          clipPath: clip,
          transition: `clip-path ${T}`,
        }}>
          <svg width={S} height={S} viewBox="0 0 16 16" fill="none"
            style={{ position:"absolute", top:0, left:`calc(100% - ${S}px)`, display:"block" }}
            aria-hidden="true">
            <path d="M16 16L0 0V16H16Z" fill={shadowColor}/>
          </svg>
          <div style={{
            position:"absolute", top:S, left:`calc(100% - ${S}px)`,
            width:S, height:`calc(100% - ${S}px)`,
            background:shadowColor,
          }}/>
          <svg width={S} height={S} viewBox="0 0 16 16" fill="none"
            style={{ position:"absolute", top:`calc(100% - ${S}px)`, left:0, display:"block" }}
            aria-hidden="true">
            <path d="M16 16L0 0L16 6.99382e-07V16Z" fill={shadowColor}/>
          </svg>
          <div style={{
            position:"absolute", top:`calc(100% - ${S}px)`, left:S,
            width:`calc(100% - ${S}px)`, height:S,
            background:shadowColor,
          }}/>
        </div>
      </div>
    </div>
  );
}
