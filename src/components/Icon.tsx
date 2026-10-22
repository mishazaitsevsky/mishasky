// One icon component for the whole site.
// Artwork comes from Misha's Figma exports (public/icons) via scripts/build-icons.mjs.
// Uses currentColor, so icons take the text color of their parent.
//
// Sizes (bounding box):
//   S  = 12  hand-tuned master   — inline with small text
//   M  = 16  hand-tuned master   — next to text in pills and links; small controls
//   L  = 24  master              — icon-only 40–56 buttons; arrows in labeled bars; nav
//   XL = 32  L master scaled up  — icon-only 64px buttons only
// Missing S/M masters fall back to the L master, scaled.

import { ICONS, type IconName, type IconMaster } from "./iconData";

export type { IconName };
export type IconSize = "S" | "M" | "L" | "XL";
export type IconDir = "up" | "right" | "down" | "left";

const PX: Record<IconSize, number> = { S: 12, M: 16, L: 24, XL: 32 };
const ROTATE: Record<IconDir, number> = { up: 0, right: 90, down: 180, left: 270 };

type IconProps = {
  name: IconName;
  size?: IconSize;
  /** Arrow masters point up; this rotates them. Square canvas, so no shift. */
  dir?: IconDir;
  /** Decorative one-offs only (e.g. the big knife on the Gameboy quiz card). Uses the L master. */
  px?: number;
  style?: React.CSSProperties;
};

export default function Icon({ name, size = "L", dir, px, style }: IconProps) {
  const set = ICONS[name] as { S?: IconMaster; M?: IconMaster; L?: IconMaster };
  const master = (px || size === "XL" || size === "L" ? set.L : set[size]) ?? set.L!;
  const dim = px ?? PX[size];
  const rotate = dir ? ROTATE[dir] : 0;

  return (
    <svg
      width={dim}
      height={dim}
      viewBox={master.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0, ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}), ...style }}
    >
      {master.paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={p.strokeWidth}
          fillRule={p.fillRule}
          clipRule={p.clipRule}
          strokeLinecap={p.strokeLinecap}
          strokeLinejoin={p.strokeLinejoin}
        />
      ))}
    </svg>
  );
}
