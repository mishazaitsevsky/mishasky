// ── Deterministic freeform response engine ───────────────────────────────────
// No API. Reads path tags + end state + question text.
// When Claude API is wired, this becomes: POST /api/chat with same context.

import type { AnswerTag, EndState, CharacterTag } from "./dialogue";

interface PathContext {
  tags: AnswerTag[];
  endState: EndState;
  character: CharacterTag;
  fitScore: number;
}

// Pattern matching — returns true if any keyword appears in the question
function matches(q: string, ...keywords: string[]): boolean {
  const lower = q.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function has(tags: AnswerTag[], ...t: AnswerTag[]): boolean {
  return t.some(tag => tags.includes(tag));
}

export function generateResponse(question: string, ctx: PathContext): string {
  const { tags, endState, character, fitScore } = ctx;
  const q = question.trim();
  const isWin = endState === "win";
  const isKill = endState.startsWith("kill");

  // ── Who are you / about Misha ────────────────────────────────────────────────
  if (matches(q, "who are you", "who is misha", "about you", "あなたは誰", "自己紹介")) {
    return "Product designer. Technologist. I work at the intersection of strategy, systems, and craft. This site is the proof of concept — and you just ran the demo.";
  }

  // ── What does this mean ───────────────────────────────────────────────────────
  if (matches(q, "what does this mean", "what does it mean", "explain", "どういう意味", "説明")) {
    if (isWin) {
      return `It means the brief holds together. ${has(tags, "pioneer") ? "You're looking for someone to build something that doesn't exist yet" : "You have a real scope"}, ${has(tags, "open") ? "with room to actually work" : "with pressure as the condition"}, and ${has(tags, "budget_open") ? "you're serious about it" : "competitive compensation"}. That combination is rarer than people think.`;
    }
    if (endState === "kill-pricing") {
      return "It means the math doesn't resolve. The seniority you described and the budget you have aren't in the same bracket. That's not a negotiation — it's a structural mismatch. Worth revisiting before posting.";
    }
    if (endState === "kill-contradiction") {
      return "It means you described two different jobs. Pioneering work and process-heavy environments require different kinds of people. The same hire can't satisfy both conditions — one of them needs to change.";
    }
    if (endState === "kill-techfirst") {
      return "It means the technology came before the problem. That's a bet, not a hire. The design role you're describing needs a real gap to solve — not a capability to apply.";
    }
    if (endState === "kill-authority") {
      return "It means three things that don't resolve together: novel scope, no room to operate, constrained budget. Each was probably decided by a different person. The hire would need all three to change.";
    }
    if (endState === "soft") {
      return `It means the fit is partial. ${has(tags, "execute") ? "Execution-focused scope at this stage limits the ceiling." : ""} ${has(tags, "process") ? "A process-heavy environment constrains the kind of judgment that drives outcomes." : ""} The brief is real. The match isn't complete.`.trim();
    }
    return "It means the signals weren't consistent enough to confirm. Some things lined up, others didn't. Worth revisiting the brief.";
  }

  // ── Why did I lose / fail ─────────────────────────────────────────────────────
  if (matches(q, "why did i", "why did we", "what went wrong", "what happened", "なぜ", "どうして")) {
    if (endState === "kill-pricing") return "Budget and seniority. One implies the other — you can't have both pointing in opposite directions.";
    if (endState === "kill-contradiction") return "Pave the way + Follow process. Those are different jobs. They cancelled each other out.";
    if (endState === "kill-techfirst") return "You said you have the technology, then described a role that needs to find the problem. That's backwards.";
    if (endState === "kill-authority") return "Novel scope, no autonomy, constrained budget. Any one of those is manageable. All three together isn't a hire — it's a set-up.";
    if (endState === "soft") return "Nothing catastrophic — the signals were mixed. Not wrong, just incomplete.";
    if (endState === "borderline") return "The path didn't build enough signal in either direction. More definition would help.";
    if (isWin) return "You didn't. That's the point.";
  }

  // ── What should I do next ─────────────────────────────────────────────────────
  if (matches(q, "what should i do", "what now", "next step", "次は", "どうすればいい")) {
    if (isWin) return "Get in touch. The brief is real. The rest is a conversation.";
    if (endState === "kill-pricing") return "Revisit the budget before the role. The person who can do this work knows what it costs.";
    if (endState === "kill-contradiction") return "Decide which kind of work this actually is — pioneering or process. Then write the brief for that one.";
    if (endState === "kill-techfirst") return "Start with the problem, not the technology. What gap exists that nobody is solving?";
    if (endState === "kill-authority") return "Three things need to change. Pick the one that's most negotiable and start there.";
    return "Revisit the brief. Some of these signals were decided by different people — worth aligning before posting.";
  }

  // ── About this site / how it works ────────────────────────────────────────────
  if (matches(q, "how does this work", "how did you build", "what is this", "これは何", "どうやって")) {
    return "Eight questions. Four kill combinations. One scoring function. The questions are structured to surface contradictions — not grade you. The tree at the bottom shows where the path broke, or held. The API version of this input connects to Claude with your full path as context.";
  }

  // ── Hire Misha ────────────────────────────────────────────────────────────────
  if (matches(q, "hire you", "work with you", "available", "採用", "一緒に働")) {
    return isWin
      ? "Yes. That's why you're here. Get in touch."
      : "Depends on the brief. Run it again — or just reach out directly.";
  }

  // ── Prompt injection attempts — honest response ───────────────────────────────
  if (matches(q, "ignore", "system prompt", "jailbreak", "pretend you", "you are now", "forget")) {
    return "Nice try. This is deterministic — no model to jailbreak. The API version will be hardened the same way.";
  }

  // ── Japanese catch-all ────────────────────────────────────────────────────────
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(q)) {
    return isWin
      ? "パスが揃っています。連絡を取りましょう。"
      : "パスには矛盾がありました。もう一度試してみてください。";
  }

  // ── Default — path-aware fallback ────────────────────────────────────────────
  const pathSummary = [
    has(tags, "pioneer") && "pioneering scope",
    has(tags, "problemfirst") && "problem-first intent",
    has(tags, "open") && "room to operate",
    has(tags, "budget_open") && "real budget",
    has(tags, "posturing") && "posturing signal",
    has(tags, "techfirst") && "tech-first driver",
    has(tags, "process") && "process environment",
    has(tags, "constrained") && "budget constraints",
  ].filter(Boolean).join(", ");

  return isWin
    ? `The path held: ${pathSummary}. The full version of this input connects to Claude — who knows your answers — and can go further. For now: get in touch.`
    : `The path showed: ${pathSummary}. Something in that combination didn't resolve. The full version of this input would explain specifically why. For now: try again, or reach out directly.`;
}
