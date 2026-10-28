// ── Dialogue engine ───────────────────────────────────────────────────────────
//
// Scoring: each answer carries a fit delta (-1, 0, +1, +2)
// Tags: semantic labels used for kill combo detection
//
// Kill combos (the 20%):
//   Pricing Kill    : tag=veteran   + tag=constrained
//   Contradiction   : tag=pioneer   + tag=process
//   Tech-first Kill : tag=techfirst + tag=pioneer
//   Authority Kill  : tag=pioneer   + tag=constrained + tag=process
//
// End states:
//   win         → score >= 7, no kill combo
//   soft        → score 2–6, no kill combo
//   borderline  → score 0–1, no kill combo
//   kill-*      → kill combo detected regardless of score

export type AnswerTag =
  | "veteran" | "senior" | "junior"
  | "pioneer" | "connect" | "execute"
  | "problemfirst" | "techfirst" | "posturing" | "improve"
  | "open" | "pressure" | "process"
  | "budget_open" | "budget_mid" | "constrained"
  | "hero" | "servant" | "seeker"
  | "builder" | "looker" | "curious";

export type EndState =
  | "win"
  | "soft"
  | "borderline"
  | "kill-pricing"
  | "kill-contradiction"
  | "kill-techfirst"
  | "kill-authority";

export interface Answer {
  text: string;
  fit: -2 | -1 | 0 | 1 | 2;
  tag?: AnswerTag;
  warn?: boolean;  // shows warning icon below the column when this answer is chosen
}

export interface Question {
  id: number;
  nodeKey: string;
  text: string;
  binary?: boolean;   // renders ✓ / ✗ / ≠ instead of A/B/C in tree
  answers: [Answer, Answer, Answer];
  quips: [string, string, string];
  crossRef?: {
    condition: (tags: AnswerTag[], fit: number) => boolean;
    text: string;
  };
}

// ── Questions ─────────────────────────────────────────────────────────────────

export const QUESTIONS: Question[] = [
  // N0 — ice breaker (costume only — fit deltas are 0, but flavor consistency weight)
  {
    id: 0,
    nodeKey: "story",
    text: "What's your story?",
    answers: [
      { text: "You can't hold the tide with a broom", fit: 0, tag: "hero"    },
      { text: "I serve the user",                     fit: 0, tag: "servant" },
      { text: "The only question is: why?",           fit: 0, tag: "seeker"  },
    ],
    quips: [
      "And yet, here you are.",
      "Welcome, child of Flynn.",
      "The only way to have time is to take it.",
    ],
  },

  // N1 — intent
  {
    id: 1,
    nodeKey: "intent",
    text: "How may I assist?",
    answers: [
      { text: "Curious",               fit: 0, tag: "curious" },
      { text: "Building something new", fit: 2, tag: "builder" },  // B = golden
      { text: "Looking for someone",   fit: 1, tag: "looker"  },
    ],
    quips: [
      "I hope you aren't a cat.",
      "Marvelous.",
      "Let's find out if it's mutual.",
    ],
  },

  // N2 — design function (ice breaker, low stakes)
  {
    id: 2,
    nodeKey: "who",
    text: "The function of design is —",
    answers: [
      { text: "To communicate", fit:  0 },
      { text: "To solve",       fit:  1 },
      { text: "To bridge",      fit:  1 },
    ],
    quips: [
      "The oldest answer. Still true.",
      "The modern answer. Also true.",
      "Communication is the medium. Solving is the function. Bridging connects the why, the how, and the what.",
    ],
  },

  // N3 — where are you
  {
    id: 3,
    nodeKey: "where",
    text: "Describe your state.",
    answers: [
      { text: "Innovating!",                      fit: -2, tag: "posturing", warn: true },
      { text: "Changing.",                        fit:  0, tag: "builder"   },
      { text: "Drilling a hole in the darkness.", fit:  2, tag: "pioneer"   },
    ],
    quips: [
      "Noted.",
      "Good. That means the problem is real.",
      "A bit dramatic, but, agreed.",
    ],
  },

  // N4 — what's driving this
  {
    id: 4,
    nodeKey: "why",
    text: "What's driving this?",
    answers: [
      { text: "We have the technology", fit: -2, tag: "techfirst",    warn: true },
      { text: "We want to level up",    fit: -1, tag: "improve"      },
      { text: "We found a gap",         fit:  2, tag: "problemfirst" },
    ],
    quips: [
      "Solution before problem. We'll see.",
      "Improvement is honest.",
      "Need is the key to real change.",
    ],
    crossRef: {
      condition: (tags) => tags.includes("pioneer"),
      text: "Paving the way requires a real problem to solve.",
    },
  },

  // N5 — role
  {
    id: 5,
    nodeKey: "role",
    text: "A new teammate needs to —",
    answers: [
      { text: "Hit the ground running", fit: -1, tag: "execute"  },
      { text: "Connect the dots",       fit:  1, tag: "connect"  },
      { text: "Pave the way",           fit:  2, tag: "pioneer"  },  // C = golden
    ],
    quips: [
      "Execution. There's always a need for it.",
      "Synthesis. Underrated.",
      "0 to 1. The hardest problem.",
    ],
  },

  // N6 — working conditions
  {
    id: 6,
    nodeKey: "env",
    text: "Needs to thrive —",
    answers: [
      { text: "In process",      fit: -2, tag: "process"  },
      { text: "Under pressure",  fit:  1, tag: "pressure" },
      { text: "In ambiguity",    fit:  2, tag: "open"     },  // C = golden
    ],
    quips: [
      "",
      "",
      "",
    ],
    crossRef: {
      condition: (tags) => tags.includes("pioneer"),
      text: "Paving the way and following process rarely go together.",
    },
  },

  // N7 — pay
  {
    id: 7,
    nodeKey: "pay",
    text: "Budget?",
    answers: [
      { text: "Competitive",         fit:  1, tag: "budget_mid"   },
      { text: "We have constraints", fit: -2, tag: "constrained"  },
      { text: "We want the best",     fit:  2, tag: "budget_open"  },  // C = golden
    ],
    quips: [
      "Fair.",
      "That's how you lose the one who'd have solved it.",
      "Good. That's how you get them.",
    ],
    crossRef: {
      condition: (tags) => tags.includes("veteran") || tags.includes("pioneer"),
      text: "Senior hires and budget constraints rarely resolve in your favor.",
    },
  },

  // N8 — AI usage
  {
    id: 8,
    nodeKey: "ai",
    text: "How does your org apply AI?",
    answers: [
      { text: "Broadly — accelerate everything",       fit: -2, tag: "techfirst", warn: true },
      { text: "We're still working it out",            fit:  0 },
      { text: "Narrowly — specific, high-value tasks", fit:  2 },
    ],
    quips: [
      "A hammer looking for nails. Noted.",
      "Honest. Keep going.",
      "The only approach that compounds.",
    ],
  },
];

// ── Kill combo detection ──────────────────────────────────────────────────────
export function resolveEndState(tags: AnswerTag[], fitScore: number): EndState {
  const has = (t: AnswerTag) => tags.includes(t);

  // Authority kill: pioneer + constrained + process (triple)
  if (has("pioneer") && has("constrained") && has("process")) return "kill-authority";

  // Pricing kill: veteran/senior ask + budget constraints
  if ((has("veteran") || has("senior")) && has("constrained")) return "kill-pricing";

  // Contradiction: pioneer role + process environment
  if (has("pioneer") && has("process")) return "kill-contradiction";

  // Tech-first: "Innovating!" at N3 + "We have the technology" at N4
  if (has("posturing") && has("techfirst")) return "kill-techfirst";

  // Score-based
  if (fitScore >= 9) return "win";
  if (fitScore >= 2) return "soft";
  return "borderline";
}

// ── End state copy ─────────────────────────────────────────────────────────────

export type CharacterTag = "hero" | "servant" | "seeker" | "default";

export const END_COPY: Record<EndState, {
  headline: (character: CharacterTag, cold?: boolean) => string;
  body: (character: CharacterTag) => string;
  terminal: string;
}>  = {
  win: {
    headline: (c, cold?: boolean) => {
      if (cold) return "Could be a fit!";
      if (c === "seeker") return "Curiosity paid off.";
      if (c === "hero")   return "I know a guy.";
      return "Looks like you'd be a great fit!";
    },
    body: () => "Get in touch.",
    terminal: "shipped.",
  },
  soft: {
    headline: () => "You'll fill the seat.",
    body: () => "Not the gap. It's possible the brief was written for one thing and the hire is for another. Either way — the fit is partial.",
    terminal: "filled.",
  },
  borderline: {
    headline: () => "Could be something.",
    body: () => "The signals aren't consistent enough to confirm. It's possible more of this was presumed than decided. Make the case — or revisit the brief.",
    terminal: "pending.",
  },
  "kill-pricing": {
    headline: () => "End of line. Senior ask. Junior budget.",
    body: () => "It's possible the constraints were presumed on someone else's behalf. Either way — the gap between what this role requires and what's on offer is structural, not negotiable.",
    terminal: "end of line.",
  },
  "kill-contradiction": {
    headline: () => "End of line. Pave the way. Follow process.",
    body: () => "These aren't opposing preferences — they describe different kinds of work entirely. It's possible one was presumed on behalf of the other. Worth finding out which one is actually true before posting again.",
    terminal: "end of line.",
  },
  "kill-techfirst": {
    headline: () => "End of line. Solution before problem.",
    body: () => "There may be a real gap in here somewhere — it's possible it just hasn't been named yet. Technology as a starting point tends to find justifications, not solutions. The brief needs a problem first.",
    terminal: "end of line.",
  },
  "kill-authority": {
    headline: () => "End of line. Novel scope. No room. No budget.",
    body: () => "Three things that don't resolve together. It's possible each was decided by a different person. The hire this brief describes would need all three to change — not negotiate around them.",
    terminal: "end of line.",
  },
};

// ── End state body summary (generated from tags) ──────────────────────────────
// Returns a 1–2 sentence plain-language summary of what the path revealed.
export function summarizePath(tags: AnswerTag[], endState: EndState): string {
  const has = (t: AnswerTag) => tags.includes(t);

  if (endState === "kill-pricing") {
    return has("pioneer")
      ? "The experience level, autonomy, and compensation don't resolve together. A 0→1 environment with a constrained budget is asking someone senior to work at a junior rate. That's not a negotiation — it's a different role."
      : "The seniority you're describing and the compensation you have in mind aren't in the same bracket. That gap is structural, not circumstantial.";
  }
  if (endState === "kill-contradiction") {
    return "A pioneering mandate in a process-heavy environment produces neither outcome well. The motivation to build something new requires the freedom to make decisions that process prevents. These are different working conditions for different kinds of work.";
  }
  if (endState === "kill-techfirst") {
    return "When the technology precedes the problem, the design hire becomes a justification exercise. The strongest product outcomes start with a real gap — not a solution looking for a use case.";
  }
  if (endState === "kill-authority") {
    return "Novel scope, no decision-making room, and a constrained budget is three separate problems wearing one job description. The person equipped to do this work knows what conditions it requires — and this brief doesn't offer them.";
  }
  if (endState === "win") {
    const parts: string[] = [];
    if (has("pioneer") || has("problemfirst")) parts.push("The intent is real and the problem exists");
    if (has("open"))         parts.push("the environment supports independent judgment");
    if (has("budget_open"))  parts.push("compensation matches the ask");
    if (has("veteran"))      parts.push("the experience level is right for the scope");
    if (has("builder"))      parts.push("there's something to actually build");
    // Cold win: pressure but not full ambiguity
    if (has("pressure") && !has("open")) {
      return "Working under pressure is a real skill. Not everything needs to be ambiguous to be meaningful — but the scope and compensation still need to align with what you're asking for.";
    }
    return parts.length > 1
      ? `${parts.join(". ")}.`
      : "The signals align — intent, environment, compensation, and scope.";
  }
  if (endState === "soft") {
    if (has("techfirst"))   return "Technology-first intent limits the problem space before the work begins. The right hire for this needs a real gap to solve, not a capability to apply.";
    if (has("process"))     return "A process-heavy environment tends to constrain the kind of judgment that drives outcomes. The motivation is there; the room to act on it may not be.";
    if (has("constrained")) return "Budget constraints at this experience level mean the role will likely be filled — just not by the person who could change the outcome.";
    return "The intent is credible and the scope is real. The fit is partial — not wrong, just incomplete.";
  }
  return "The signals are mixed. Intent and motivation are there; environment and compensation need more definition.";
}
// Returns the nodeKey where the kill was sealed
export function resolveKillNode(endState: EndState, _tags: AnswerTag[]): string | null {
  switch (endState) {
    case "kill-pricing":      return "pay";        // confirmed at N7
    case "kill-contradiction": return "env";        // confirmed at N6
    case "kill-techfirst":    return "why";        // confirmed at N4+N5 combo
    case "kill-authority":    return "pay";        // all three needed, sealed at N7
    default: return null;
  }
}

// ── Retry copy ────────────────────────────────────────────────────────────────
export function retryCopy(_endState: EndState): string {
  return "Try again?";
}

// ── RPG text adventure (unlocked on win) ──────────────────────────────────────
export const RPG_SCENES = [
  {
    id: "start",
    text: "You are in a room.\nThere is a door to the left.\nA laptop sits open on the desk.",
    options: [
      { label: "→ Open the laptop", next: "laptop" },
      { label: "← Try the door",    next: "door"   },
    ],
  },
  {
    id: "laptop",
    text: "The screen shows a portfolio.\nYou've seen it before.\nThere is a contact form.",
    options: [
      { label: "→ Fill it out", next: "contact" },
      { label: "← Go back",    next: "start"   },
    ],
  },
  {
    id: "door",
    text: "The door is locked.\nThere's a note: 'Try the laptop.'",
    options: [
      { label: "→ Fine. The laptop.", next: "laptop" },
    ],
  },
  {
    id: "contact",
    text: "You did it.\nA confirmation appears:\ncontact@mishasky.net",
    options: [
      { label: "↑ Send an email", next: "email" },
    ],
  },
  {
    id: "email",
    text: "The adventure ends here.\nFor now.",
    options: [],
    exit: "mailto:contact@mishasky.net",
  },
];
