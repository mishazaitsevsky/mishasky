// ── Motion system ─────────────────────────────────────────────────────────────
export const CURVE = "cubic-bezier(0.5, 0, 0.85, 1)";

export const T = {
  "1x": 200,
  "2x": 400,
  "3x": 600,
} as const;

export function duration(multiplier: keyof typeof T): string {
  return `${T[multiplier]}ms`;
}

export function transition(
  property: string,
  multiplier: keyof typeof T = "1x",
  delay = 0
): string {
  return `${property} ${T[multiplier]}ms ${CURVE}${delay ? ` ${delay}ms` : ""}`;
}

export const anim = {
  pageIn:  `pageIn  ${T["1x"]}ms ${CURVE} both`,
  pageOut: `pageOut ${T["1x"]}ms ${CURVE} both`,
  fadeIn:  `fadeIn  ${T["1x"]}ms ${CURVE} both`,
};

// Paste into any <style> block
export const keyframes = `
  @keyframes pageIn {
    from { transform: translateY(40px); opacity: 1; }
    to   { transform: translateY(0);    opacity: 1; }
  }
  @keyframes pageOut {
    from { transform: translateY(0);    opacity: 1; }
    to   { transform: translateY(40px); opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;
