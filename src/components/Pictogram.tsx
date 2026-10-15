// ── Floppy-disk era schematics ───────────────────────────────────────────────
// Positive/negative space, geometric, monochrome.
// All shapes are on a 64×64 grid, stroke-based, no fills except negative-space cuts.

type PictogramName = "cursor" | "warning" | "fork" | "maze" | "clock";

interface PictogramProps {
  name: PictogramName;
  size?: number;
  color?: string;
}

export default function Pictogram({ name, size = 64, color = "rgba(255,255,255,0.6)" }: PictogramProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    style: { display: "block" as const },
  };

  switch (name) {

    // ── CURSOR — intent / navigation
    // Arrow pointer with a crosshair underneath — "why are you here"
    case "cursor":
      return (
        <svg {...props}>
          {/* Arrow body */}
          <path d="M12 8L12 44L22 34L28 52L34 50L28 32L42 32L12 8Z"
            stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
          {/* Crosshair rings */}
          <circle cx="48" cy="48" r="8" stroke={color} strokeWidth="1.5" strokeDasharray="3 2"/>
          <circle cx="48" cy="48" r="3" stroke={color} strokeWidth="1.5"/>
          {/* Crosshair lines */}
          <line x1="48" y1="37" x2="48" y2="41" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="48" y1="55" x2="48" y2="59" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="37" y1="48" x2="41" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="55" y1="48" x2="59" y2="48" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ── WARNING — risk / the thing that scared you
    // Diamond warning sign with inner bolt — schematic safety symbol
    case "warning":
      return (
        <svg {...props}>
          {/* Outer diamond */}
          <rect x="8" y="8" width="48" height="48" transform="rotate(45 32 32)"
            stroke={color} strokeWidth="2"/>
          {/* Inner diamond (negative space cut) */}
          <rect x="16" y="16" width="32" height="32" transform="rotate(45 32 32)"
            stroke={color} strokeWidth="1" strokeDasharray="2 3"/>
          {/* Bolt / exclamation schematic */}
          <path d="M35 18L28 32H35L29 46" stroke={color} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"/>
          {/* Corner tick marks — schematic detail */}
          <line x1="32" y1="4" x2="32" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="32" y1="56" x2="32" y2="60" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="4" y1="32" x2="8" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="56" y1="32" x2="60" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );

    // ── FORK — decision / pick one
    // Single path splitting into three branches — circuit board style
    case "fork":
      return (
        <svg {...props}>
          {/* Main stem */}
          <line x1="32" y1="8" x2="32" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          {/* Junction dot */}
          <circle cx="32" cy="26" r="3" fill={color}/>
          {/* Left branch */}
          <path d="M32 26 L14 26 L14 44" stroke={color} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
          {/* Center branch */}
          <line x1="32" y1="26" x2="32" y2="44" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Right branch */}
          <path d="M32 26 L50 26 L50 44" stroke={color} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
          {/* Terminal squares */}
          <rect x="9" y="44" width="10" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
          <rect x="27" y="44" width="10" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
          <rect x="45" y="44" width="10" height="10" rx="1" stroke={color} strokeWidth="1.5"/>
          {/* Labels A B C as dots inside terminals */}
          <circle cx="14" cy="49" r="2" fill={color}/>
          <circle cx="32" cy="49" r="2" fill={color}/>
          <circle cx="50" cy="49" r="2" fill={color}/>
        </svg>
      );

    // ── MAZE — problem solving / stuck
    // Top-down maze schematic, one clear path visible
    case "maze":
      return (
        <svg {...props}>
          {/* Outer border with entrance/exit gaps */}
          <path d="M8 8 H56 V56 H8 V8" stroke={color} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="48 8 48 100"/>
          {/* Outer border solid */}
          <rect x="8" y="8" width="48" height="48" stroke={color} strokeWidth="2"/>
          {/* Entrance gap top */}
          <rect x="26" y="6" width="12" height="4" fill="#1B6EF3"/>
          {/* Exit gap bottom */}
          <rect x="26" y="54" width="12" height="4" fill="#1B6EF3"/>
          {/* Inner walls — simplified maze */}
          <path d="M20 8 V32 H44" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M32 20 H56" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 44 H32 V32" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M44 44 V56" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Solution path — dotted */}
          <path d="M32 8 V20 H56 V44 H44 V56"
            stroke={color} strokeWidth="1" strokeDasharray="2 3"
            strokeLinecap="round" strokeLinejoin="round"
            opacity="0.5"/>
        </svg>
      );

    // ── CLOCK — time / meetings
    // Analogue clock face, schematic style with tick marks
    case "clock":
      return (
        <svg {...props}>
          {/* Outer ring */}
          <circle cx="32" cy="32" r="24" stroke={color} strokeWidth="2"/>
          {/* Inner ring */}
          <circle cx="32" cy="32" r="20" stroke={color} strokeWidth="0.75" opacity="0.4"/>
          {/* Hour tick marks — 12 positions */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const inner = i % 3 === 0 ? 17 : 19;
            const outer = 22;
            return (
              <line
                key={i}
                x1={32 + inner * Math.cos(angle)}
                y1={32 + inner * Math.sin(angle)}
                x2={32 + outer * Math.cos(angle)}
                y2={32 + outer * Math.sin(angle)}
                stroke={color}
                strokeWidth={i % 3 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
          {/* Hour hand — pointing to ~2 (long meeting) */}
          <line x1="32" y1="32" x2="42" y2="22"
            stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
          {/* Minute hand — pointing to 12 */}
          <line x1="32" y1="32" x2="32" y2="13"
            stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          {/* Center dot */}
          <circle cx="32" cy="32" r="2.5" fill={color}/>
          {/* Mounting holes — schematic detail */}
          <circle cx="32" cy="8" r="2" stroke={color} strokeWidth="1"/>
          <circle cx="32" cy="56" r="2" stroke={color} strokeWidth="1"/>
          <circle cx="8" cy="32" r="2" stroke={color} strokeWidth="1"/>
          <circle cx="56" cy="32" r="2" stroke={color} strokeWidth="1"/>
        </svg>
      );

    default:
      return null;
  }
}
