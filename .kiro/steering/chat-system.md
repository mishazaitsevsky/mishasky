# Chat / Quiz System

## The core idea
The chat isn't just a contact form or a chatbot. It's a structured screening experience that works both ways — it qualifies the visitor while giving them something valuable in return, regardless of outcome.

## The narrative arc (3 acts)

**1. The question before the answer**
The quiz makes the visitor articulate what they actually need before seeing any result. The archetype isn't a label dropped on them — it's a moment of recognition. The questions are designed so the *path* reveals the person, not just the final answer.

**2. The takeaway as value**
Even a "no" outcome should leave the visitor with something useful: clarity on what they're looking for, language they can use, or a referral framing. The goal is "Misha helped me figure it out, even if he isn't it." That's the difference between a gimmick and a tool.

**3. Numeric credibility**
Stats anchor the soft claims. Example: "This type of systems thinking shows up in 56% of mid-level design roles." Numbers make instinct feel validated and citable.

## Current implementation
Lives entirely in `SiteShell.tsx`. Key pieces:
- `QUESTIONS` array — 6 questions, each with 3 answers (A/B/C), each answer has a `type` and `fit` score
- `resolveArchetype(answerTypes)` — maps answer pattern to one of ~4 archetypes
- `resolveEndState(fitScore)` — maps numeric score to: `pass`, `borderline`, `fail`, `complete`
- `END_COPY` — per-endState/archetype copy (headline + body)
- `useTypewriter` hook — types out question + options line by line
- Chat state: `phase` (question → processing → done), `step`, `selected`, `chatKey`
- `redPulse` — visual warning at Q5 if borderline

## Archetypes (current)
Determined by the pattern of answer types across 6 questions. Each archetype gets a personalized result.

## What needs work
- The "why we built this" framing — the quiz needs a clearer setup so visitors understand why they're being asked before they start
- End states need the numeric backup woven into the copy
- The takeaway for non-pass outcomes needs to feel genuinely useful, not consolation

## Rendering
- Standard theme: `.chat-card` overlay, A/B/C buttons + confirm arrow
- Brutal theme: same card, button row reuses `NavButtons` with `chatButtons` prop
- Gameboy theme: Screen component inside the shell, A/B/C as `GameboyButton`, confirm as `ArrowButton`
