"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NodeId = string;

type Choice = {
  label: string;
  next: NodeId;
  score?: number;        // positive = good signal, negative = flag
  tag?: string;          // semantic tag for combo detection
  replyOverride?: string; // system reply that differs from next node prompt
};

type DialogueNode = {
  id: NodeId;
  prompt: string;
  subprompt?: string;    // smaller line under prompt
  choices?: Choice[];
  isEnd?: boolean;
  endType?: "win" | "loss" | "exit";
  lossType?: "sd-pricing" | "sd-contradiction" | "sd-techfirst" | "sd-authority" | "soft";
  // which N0/N1 character label this ending speaks back to
};

// ─── Spinner data ─────────────────────────────────────────────────────────────

const ARCHETYPES = ["∴", "⊕", "◈", "⌘", "⍟", "⬡", "◎"];
const TEMPERAMENTS = ["clinical", "feral", "measured", "bold", "quiet", "exact", "loose"];
const AESTHETICS = ["retro", "brutalist", "organic", "minimal", "dense", "flat", "raw"];

// ─── Dialogue tree ────────────────────────────────────────────────────────────
//
// N0  — ice breaker (costume only, not scored)
// N1  — intent (routes clean-exit early)
// N2  — who are you looking for
// N3  — where are you
// N4  — what's driving this
// N5  — needs to (role)
// N6  — needs to survive (working conditions)
// N7  — pay
// END — win / loss / exit
//
// Kill combos (the 20%):
//   Pricing Kill   : tag=veteran + tag=constrained
//   Contradiction  : tag=pioneer  + tag=process
//   Tech-first     : tag=techfirst + tag=pioneer
//   Authority Kill : tag=pioneer  + tag=noroom + tag=constrained (triple)
//
// Soft loss: accumulated score <= 0 by N7, no single kill

const TREE: Record<NodeId, DialogueNode> = {

  // ── N0: ice breaker ─────────────────────────────────────────────────────────
  n0: {
    id: "n0",
    prompt: "What's your story?",
    choices: [
      { label: "Someone's gotta save our skins",  next: "n1", tag: "hero"    },
      { label: "I serve the user",                 next: "n1", tag: "servant" },
      { label: "The only question is: why?",       next: "n1", tag: "seeker"  },
    ],
  },

  // ── N1: intent ──────────────────────────────────────────────────────────────
  n1: {
    id: "n1",
    prompt: "How may I assist?",
    choices: [
      { label: "Looking for someone",   next: "n2",    score: 1  },
      { label: "Building something new",next: "n2",    score: 2, tag: "builder" },
      { label: "Curious",               next: "exit_curious", score: 0 },
    ],
  },

  // ── N2: who ─────────────────────────────────────────────────────────────────
  n2: {
    id: "n2",
    prompt: "I'm looking for —",
    choices: [
      { label: "The Architect",  next: "n3", score: 2, tag: "veteran",  replyOverride: "Rare brief." },
      { label: "The Oracle",     next: "n3", score: 1, tag: "senior",   replyOverride: "Interesting." },
      { label: "The One",        next: "n3", score: 2, tag: "veteran",  replyOverride: "Marvelous." },
    ],
  },

  // ── N3: where are you ───────────────────────────────────────────────────────
  n3: {
    id: "n3",
    prompt: "Where are you?",
    choices: [
      { label: "We are paving the way",  next: "n4", score: 2, tag: "pioneer"   },
      { label: "We are well funded",     next: "n4", score: 1, tag: "funded"    },
      { label: "Up and running",         next: "n4", score: 0, tag: "established" },
    ],
  },

  // ── N4: what's driving this ─────────────────────────────────────────────────
  n4: {
    id: "n4",
    prompt: "What's driving this?",
    choices: [
      { label: "We found a gap",          next: "n5", score: 2, tag: "problemfirst" },
      { label: "We have the technology",  next: "n5", score: -1, tag: "techfirst"   },
      { label: "We want to level up",     next: "n5", score: 0, tag: "improve"      },
    ],
  },

  // ── N5: role ─────────────────────────────────────────────────────────────────
  n5: {
    id: "n5",
    prompt: "Needs to —",
    choices: [
      { label: "Pave the way",       next: "n6", score: 2, tag: "pioneer"  },
      { label: "Connect the dots",   next: "n6", score: 1, tag: "connect"  },
      { label: "Hit the ground",     next: "n6", score: 0, tag: "execute"  },
    ],
  },

  // ── N6: working conditions ───────────────────────────────────────────────────
  n6: {
    id: "n6",
    prompt: "Needs to survive —",
    choices: [
      { label: "Ambiguity",  next: "n7", score: 2, tag: "open"    },
      { label: "Pressure",   next: "n7", score: 1, tag: "pressure"},
      { label: "Process",    next: "n7", score: -1, tag: "process" },
    ],
  },

  // ── N7: pay ──────────────────────────────────────────────────────────────────
  n7: {
    id: "n7",
    prompt: "Budget?",
    choices: [
      { label: "Whatever it takes",   next: "eval", score: 2, tag: "budget_open"        },
      { label: "Competitive",         next: "eval", score: 1, tag: "budget_competitive" },
      { label: "We have constraints", next: "eval", score: -2, tag: "constrained"       },
    ],
  },

  // ── Eval node (invisible — resolved in code) ─────────────────────────────────
  eval: { id: "eval", prompt: "" },

  // ── Endings ──────────────────────────────────────────────────────────────────
  win: {
    id: "win",
    prompt: "Novel problem. Real scope. Room to move.",
    subprompt: "That's the brief.",
    isEnd: true,
    endType: "win",
  },

  loss_pricing: {
    id: "loss_pricing",
    prompt: "Senior ask. Junior budget.",
    subprompt: "The math doesn't work.",
    isEnd: true,
    endType: "loss",
    lossType: "sd-pricing",
  },

  loss_contradiction: {
    id: "loss_contradiction",
    prompt: "Pave the way. Follow process.",
    subprompt: "You described two jobs.",
    isEnd: true,
    endType: "loss",
    lossType: "sd-contradiction",
  },

  loss_techfirst: {
    id: "loss_techfirst",
    prompt: "Solution before problem.",
    subprompt: "Rarely ends well.",
    isEnd: true,
    endType: "loss",
    lossType: "sd-techfirst",
  },

  loss_authority: {
    id: "loss_authority",
    prompt: "Novel scope. No room to move. No budget to match.",
    subprompt: "You need the person who'd make that call. You're not offering them the call.",
    isEnd: true,
    endType: "loss",
    lossType: "sd-authority",
  },

  loss_soft: {
    id: "loss_soft",
    prompt: "You'll fill the seat.",
    subprompt: "Not the gap.",
    isEnd: true,
    endType: "loss",
    lossType: "soft",
  },

  exit_curious: {
    id: "exit_curious",
    prompt: "I hope you aren't a cat.",
    subprompt: "Have a look around.",
    isEnd: true,
    endType: "exit",
  },
};

// ─── N0 reply map (character-based, not scored) ───────────────────────────────
const N0_REPLIES: Record<string, string> = {
  hero:    "Understood, your highness.",
  servant: "Welcome, child of Flynn.",
  seeker:  "The only way to have time is to take it.",
};

// ─── Win ending copy varies by N0 character ───────────────────────────────────
const WIN_BY_CHARACTER: Record<string, string> = {
  hero:    "Turns out saving skins requires the right hire.",
  servant: "The user is well served by a good brief.",
  seeker:  "It seems your curiosity paid off.",
  default: "That's the brief.",
};

// ─── Combo detection ──────────────────────────────────────────────────────────
function resolveEnding(tags: string[], score: number): NodeId {
  const has = (t: string) => tags.includes(t);

  // Pricing kill: veteran-level ask + budget constraints
  if ((has("veteran") || has("senior")) && has("constrained")) return "loss_pricing";

  // Contradiction: pioneer role + process working conditions
  if (has("pioneer") && has("process")) return "loss_contradiction";

  // Tech-first: technology-driven + pioneer scope
  if (has("techfirst") && has("pioneer")) return "loss_techfirst";

  // Authority kill: pioneer + no open budget + process
  if (has("pioneer") && has("constrained") && has("process")) return "loss_authority";

  // Win: good score, no kills
  if (score >= 7) return "win";

  // Soft loss
  return "loss_soft";
}

// ─── Warning threshold ────────────────────────────────────────────────────────
// Light blinks when score <= -1 AND at least 2 negative tags accumulated
function isWarning(score: number, tags: string[]): boolean {
  const negTags = ["techfirst", "process", "constrained", "execute"];
  const negCount = tags.filter(t => negTags.includes(t)).length;
  return score <= -1 && negCount >= 2;
}

// ─── Spinner component ────────────────────────────────────────────────────────
function Spinner({ onDone }: { onDone: (result: { archetype: string; temperament: string; aesthetic: string }) => void }) {
  const [reels, setReels] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState(false);
  const [settled, setSettled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function spin() {
    if (spinning || settled) return;
    setSpinning(true);

    let ticks = 0;
    const totalTicks = 18 + Math.floor(Math.random() * 10);

    intervalRef.current = setInterval(() => {
      ticks++;
      setReels([
        Math.floor(Math.random() * ARCHETYPES.length),
        Math.floor(Math.random() * TEMPERAMENTS.length),
        Math.floor(Math.random() * AESTHETICS.length),
      ]);
      if (ticks >= totalTicks) {
        clearInterval(intervalRef.current!);
        // Hard stop with overshoot settle
        const final = [
          Math.floor(Math.random() * ARCHETYPES.length),
          Math.floor(Math.random() * TEMPERAMENTS.length),
          Math.floor(Math.random() * AESTHETICS.length),
        ];
        setReels(final);
        setSpinning(false);
        setSettled(true);
        setTimeout(() => {
          onDone({
            archetype:   ARCHETYPES[final[0]],
            temperament: TEMPERAMENTS[final[1]],
            aesthetic:   AESTHETICS[final[2]],
          });
        }, 400);
      }
    }, 60);
  }

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "0.5rem 0" }}>
      {/* Three reels */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        {[
          { items: ARCHETYPES,   idx: reels[0] },
          { items: TEMPERAMENTS, idx: reels[1] },
          { items: AESTHETICS,   idx: reels[2] },
        ].map((reel, ri) => (
          <div
            key={ri}
            style={{
              width: ri === 0 ? "2rem" : "4.5rem",
              height: "1.8rem",
              overflow: "hidden",
              borderBottom: "1px solid #333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: ri === 0 ? "1.1rem" : "0.65rem",
                color: settled ? "#f0efeb" : "#666",
                letterSpacing: "0.04em",
                transition: spinning ? "none" : "color 0.3s",
                display: "block",
              }}
            >
              {reel.items[reel.idx]}
            </span>
          </div>
        ))}
      </div>

      {!settled && (
        <button
          onClick={spin}
          disabled={spinning}
          style={{
            background: "none",
            border: "1px solid #333",
            color: spinning ? "#444" : "#f0efeb",
            padding: "0.4rem 1rem",
            cursor: spinning ? "default" : "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            transition: "color 0.15s",
          }}
        >
          {spinning ? "···" : "roll"}
        </button>
      )}
    </div>
  );
}

// ─── Warning light ─────────────────────────────────────────────────────────────
function WarningLight({ active }: { active: boolean }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!active) { setBlink(false); return; }
    const id = setInterval(() => setBlink(b => !b), 600);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div
      aria-hidden="true"
      title={active ? "Signal degrading" : undefined}
      style={{
        width: "0.45rem",
        height: "0.45rem",
        borderRadius: "50%",
        background: active && blink ? "#ff4444" : "#333",
        boxShadow: active && blink ? "0 0 6px 2px rgba(255,60,60,0.6)" : "none",
        transition: "background 0.15s, box-shadow 0.15s",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Tree reveal ──────────────────────────────────────────────────────────────
//
// Shows the path taken as a horizontal bracket tree.
// Each step = one column. Visited node is highlighted.
// Kill node is red-filled. Unvisited siblings are dimmed outlines.

const NODE_LABELS: Record<string, string> = {
  n0: "story",
  n1: "intent",
  n2: "who",
  n3: "where",
  n4: "why",
  n5: "role",
  n6: "env",
  n7: "pay",
};

// Ordered spine of the tree (excludes eval/end nodes)
const SPINE = ["n0", "n1", "n2", "n3", "n4", "n5", "n6", "n7"];

function TreeReveal({
  path,
  killNodeId,
  endType,
}: {
  path: { nodeId: string; choiceLabel: string }[];
  killNodeId: string | null;
  endType: "win" | "loss" | "exit";
}) {
  const visitedMap = new Map(path.map((p, i) => [p.nodeId, i]));
  const killIdx = killNodeId ? SPINE.indexOf(killNodeId) : -1;
  // For sudden-death, only show spine up to kill + 1
  const visibleSpine = killIdx >= 0 ? SPINE.slice(0, killIdx + 1) : SPINE;

  const BOX_W = 28;
  const BOX_H = 18;
  const COL_W = 44;
  const ROWS = 3;
  const ROW_H = 22;
  const PAD_TOP = 8;
  const PAD_LEFT = 16;

  const svgW = PAD_LEFT * 2 + visibleSpine.length * COL_W + 40;
  const svgH = PAD_TOP * 2 + ROWS * ROW_H + 16;

  // Each column: 3 sibling boxes stacked. Middle = visited, shown bright.
  // We just show A/B/C as siblings — visited one is determined by path.
  function choiceIndexForNode(nid: string): number {
    const step = path.find(p => p.nodeId === nid);
    if (!step) return -1;
    const node = TREE[nid];
    if (!node.choices) return 0;
    return node.choices.findIndex(c => c.label === step.choiceLabel);
  }

  return (
    <div style={{ marginTop: "0.75rem", overflowX: "auto" }}>
      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: "block" }}
        aria-label="Decision path"
      >
        {/* Connector line */}
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + ROW_H + BOX_H / 2}
          x2={PAD_LEFT + visibleSpine.length * COL_W}
          y2={PAD_TOP + ROW_H + BOX_H / 2}
          stroke="#2a2a2a"
          strokeWidth="1"
        />

        {/* Start arrow */}
        <polygon
          points={`${PAD_LEFT - 8},${PAD_TOP + ROW_H + BOX_H / 2 - 4} ${PAD_LEFT},${PAD_TOP + ROW_H + BOX_H / 2} ${PAD_LEFT - 8},${PAD_TOP + ROW_H + BOX_H / 2 + 4}`}
          fill="#444"
        />

        {visibleSpine.map((nid, colIdx) => {
          const x = PAD_LEFT + colIdx * COL_W;
          const visitedChoice = choiceIndexForNode(nid);
          const isKill = nid === killNodeId;
          const wasVisited = visitedMap.has(nid);
          const node = TREE[nid];
          const choiceCount = node.choices?.length ?? 3;

          return (
            <g key={nid}>
              {/* Column label */}
              <text
                x={x + BOX_W / 2}
                y={PAD_TOP - 1}
                textAnchor="middle"
                fontSize="6"
                fill="#444"
                fontFamily="monospace"
              >
                {NODE_LABELS[nid] ?? nid}
              </text>

              {/* Sibling boxes */}
              {Array.from({ length: choiceCount }).map((_, rowIdx) => {
                const y = PAD_TOP + rowIdx * ROW_H;
                const isChosen = wasVisited && rowIdx === visitedChoice;
                const isKillBox = isKill && isChosen;

                let fill = "none";
                let stroke = "#2a2a2a";
                let textFill = "#444";

                if (isKillBox) {
                  fill = "#cc0000";
                  stroke = "#cc0000";
                  textFill = "#fff";
                } else if (isChosen && endType === "win") {
                  fill = "#1a3a1a";
                  stroke = "#4a8a4a";
                  textFill = "#4a8a4a";
                } else if (isChosen) {
                  fill = "#1a1a1a";
                  stroke = "#555";
                  textFill = "#ccc";
                }

                const label = String.fromCharCode(65 + rowIdx); // A, B, C

                return (
                  <g key={rowIdx}>
                    {/* Connector from spine to box (only non-middle rows) */}
                    {rowIdx !== 1 && wasVisited && (
                      <line
                        x1={x}
                        y1={PAD_TOP + ROW_H + BOX_H / 2}
                        x2={x}
                        y2={y + BOX_H / 2}
                        stroke="#2a2a2a"
                        strokeWidth="1"
                      />
                    )}
                    <rect
                      x={x}
                      y={y}
                      width={BOX_W}
                      height={BOX_H}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth="1"
                    />
                    <text
                      x={x + BOX_W / 2}
                      y={y + BOX_H / 2 + 3}
                      textAnchor="middle"
                      fontSize="7"
                      fill={textFill}
                      fontFamily="monospace"
                      fontWeight={isChosen ? "bold" : "normal"}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* "end of line" label on kill */}
              {isKill && (
                <text
                  x={x + BOX_W + 4}
                  y={PAD_TOP + visitedChoice * ROW_H + BOX_H / 2 + 3}
                  fontSize="7"
                  fill="#cc0000"
                  fontFamily="monospace"
                >
                  end of line
                </text>
              )}
            </g>
          );
        })}

        {/* Win terminal */}
        {!killNodeId && endType === "win" && (
          <text
            x={PAD_LEFT + visibleSpine.length * COL_W + 4}
            y={PAD_TOP + ROW_H + BOX_H / 2 + 3}
            fontSize="7"
            fill="#4a8a4a"
            fontFamily="monospace"
          >
            shipped.
          </text>
        )}

        {/* Soft loss terminal */}
        {!killNodeId && endType === "loss" && (
          <text
            x={PAD_LEFT + visibleSpine.length * COL_W + 4}
            y={PAD_TOP + ROW_H + BOX_H / 2 + 3}
            fontSize="7"
            fill="#888"
            fontFamily="monospace"
          >
            filled.
          </text>
        )}
      </svg>
    </div>
  );
}

// ─── Main Chat component ──────────────────────────────────────────────────────
export default function Chat() {
  const [open, setOpen] = useState(false);

  // Phase: "spinner" | "dialogue" | "end"
  const [phase, setPhase] = useState<"spinner" | "dialogue" | "end">("spinner");
  const [costume, setCostume] = useState<{ archetype: string; temperament: string; aesthetic: string } | null>(null);

  const [nodeId, setNodeId] = useState<NodeId>("n0");
  const [score, setScore] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [character, setCharacter] = useState<string>("default"); // N0 tag for ending copy

  // Path history for tree reveal: [{nodeId, choiceLabel}]
  const [pathHistory, setPathHistory] = useState<{ nodeId: string; choiceLabel: string }[]>([]);
  const [killNode, setKillNode] = useState<string | null>(null);

  const [messages, setMessages] = useState<{ role: "system" | "user"; text: string; sub?: string }[]>([]);
  const [endNode, setEndNode] = useState<DialogueNode | null>(null);

  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages]);

  const node = TREE[nodeId];
  const warn = isWarning(score, tags);

  function startDialogue(c: typeof costume) {
    setCostume(c);
    setPhase("dialogue");
    setMessages([{ role: "system", text: TREE["n0"].prompt }]);
  }

  function handleChoice(choice: Choice) {
    const newScore = score + (choice.score ?? 0);
    const newTags = choice.tag ? [...tags, choice.tag] : tags;
    setScore(newScore);
    setTags(newTags);

    // Track N0 character
    if (nodeId === "n0" && choice.tag) setCharacter(choice.tag);

    // Record path
    const newPath = [...pathHistory, { nodeId, choiceLabel: choice.label }];
    setPathHistory(newPath);

    // N0 gets a flavored reply, not the next node prompt
    const isN0 = nodeId === "n0";
    const replyText = isN0
      ? N0_REPLIES[choice.tag ?? ""] ?? ""
      : choice.replyOverride ?? null;

    // Determine next node
    let nextId = choice.next;

    // At eval node, resolve ending
    if (nextId === "eval") {
      nextId = resolveEnding(newTags, newScore);
    }

    const nextNode = TREE[nextId];

    // Build message queue
    const newMsgs: typeof messages = [
      ...messages,
      { role: "user", text: choice.label },
    ];

    if (replyText) {
      newMsgs.push({ role: "system", text: replyText });
    }

    if (!nextNode.isEnd && nextNode.prompt) {
      newMsgs.push({ role: "system", text: nextNode.prompt });
    }

    if (nextNode.isEnd) {
      // Win copy varies by character
      const finalPrompt = nextId === "win"
        ? (WIN_BY_CHARACTER[character] ?? WIN_BY_CHARACTER.default)
        : nextNode.prompt;
      const finalSub = nextNode.subprompt;
      newMsgs.push({ role: "system", text: finalPrompt, sub: finalSub });
      setEndNode(nextNode);
      setPhase("end");

      // Determine kill node for sudden-death endings
      if (nextNode.lossType && nextNode.lossType !== "soft") {
        // Kill is the last visited spine node
        const lastSpineNode = [...newPath].reverse().find(p => SPINE.includes(p.nodeId));
        setKillNode(lastSpineNode?.nodeId ?? null);
      }
    }

    setMessages(newMsgs);
    setNodeId(nextId);
  }

  function handleReset() {
    setPhase("spinner");
    setCostume(null);
    setNodeId("n0");
    setScore(0);
    setTags([]);
    setCharacter("default");
    setMessages([]);
    setEndNode(null);
    setPathHistory([]);
    setKillNode(null);
  }

  const retryLabel = endNode?.endType === "loss" ? "Post the role again?" : "Start over";

  return (
    <>
      {/* ── Trigger button ───────────────────────────────────────────────────── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Hire Power"
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "2.5rem",
            height: "2.5rem",
            background: "var(--fg)",
            color: "var(--bg)",
            border: "none",
            borderRadius: "0",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          {costume?.archetype ?? "◎"}
        </button>
      )}

      {/* ── Chat panel ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          role="dialog"
          aria-label="Hire Power"
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            width: "min(360px, calc(100vw - 2rem))",
            background: "#0a0a0a",
            color: "#f0efeb",
            border: "1px solid #222",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
          }}
        >
          {/* ── Header ───────────────────────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.65rem 1rem",
              borderBottom: "1px solid #222",
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              gap: "0.5rem",
            }}
          >
            <span style={{ opacity: 0.3, fontSize: "0.7rem" }}>
              {costume?.archetype ?? "·"}
            </span>

            {/* Costume label when settled */}
            {costume && (
              <span style={{ opacity: 0.25, fontSize: "0.55rem", letterSpacing: "0.08em", flex: 1 }}>
                {costume.temperament} · {costume.aesthetic}
              </span>
            )}

            {/* Warning light — replaces loader dot when degrading */}
            <WarningLight active={warn} />

            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                color: "#f0efeb",
                cursor: "pointer",
                opacity: 0.3,
                fontSize: "1rem",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* ── Body ─────────────────────────────────────────────────────────── */}

          {/* Spinner phase */}
          {phase === "spinner" && (
            <div style={{ padding: "1.25rem 1rem" }}>
              <div style={{ opacity: 0.4, fontSize: "0.6rem", letterSpacing: "0.1em", marginBottom: "1rem", textTransform: "uppercase" }}>
                Hire Power
              </div>
              <Spinner onDone={startDialogue} />
            </div>
          )}

          {/* Dialogue phase */}
          {phase !== "spinner" && (
            <>
              <div
                ref={logRef}
                role="log"
                aria-live="polite"
                style={{
                  padding: "1.25rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  maxHeight: "280px",
                  overflowY: "auto",
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      textAlign: msg.role === "user" ? "right" : "left",
                      opacity: msg.role === "user" ? 0.45 : 1,
                      lineHeight: 1.6,
                    }}
                  >
                    <span>{msg.text}</span>
                    {msg.sub && (
                      <span style={{ display: "block", opacity: 0.45, fontSize: "0.65rem", marginTop: "0.2rem" }}>
                        {msg.sub}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Choices / end actions ──────────────────────────────────────── */}
              <div style={{ borderTop: "1px solid #222", padding: "0.75rem 1rem" }}>
                {phase === "end" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {/* Tree reveal */}
                    <TreeReveal
                      path={pathHistory}
                      killNodeId={killNode}
                      endType={endNode?.endType ?? "loss"}
                    />

                    {endNode?.endType === "win" && (
                      <button
                        onClick={() => {}}
                        style={choiceStyle}
                      >
                        See the work →
                      </button>
                    )}
                    <button
                      onClick={handleReset}
                      style={{
                        ...choiceStyle,
                        opacity: 0.35,
                        fontSize: "0.62rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {retryLabel}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {node.choices?.map((choice, i) => (
                      <ChoiceButton key={i} choice={choice} onClick={() => handleChoice(choice)} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Shared button style object ───────────────────────────────────────────────
const choiceStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#f0efeb",
  padding: "0.4rem 0",
  cursor: "pointer",
  fontFamily: "var(--font-mono)",
  fontSize: "0.72rem",
  letterSpacing: "0.02em",
  textAlign: "left",
  opacity: 0.65,
  borderBottom: "1px solid transparent",
  transition: "opacity 0.15s, border-color 0.15s",
  display: "block",
  width: "100%",
};

// ─── Choice button with hover ─────────────────────────────────────────────────
function ChoiceButton({ choice, onClick }: { choice: Choice; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...choiceStyle,
        opacity: hovered ? 1 : 0.65,
        borderBottomColor: hovered ? "#333" : "transparent",
      }}
    >
      {choice.label}
    </button>
  );
}
