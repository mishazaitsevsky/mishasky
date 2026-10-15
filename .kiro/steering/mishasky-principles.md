# mishasky.net — Design & Layout Principles

## Anatomical development rule
Work on one layer at a time. Components (buttons, cards, BrutalShadow) are complete units — do not alter their internal geometry when making layout changes. Do not alter layout spacers when fixing component internals. Changes should be isolated to the layer being worked on.

## Brutalist shadow height accounting
BrutalShadow adds 16px to the **bottom** and **right** of any unpressed element (position:absolute, overflow:visible — does not affect document flow). Pressed state moves the face 16px down+right, shadow disappears — same bounding box.

When matching the height of a brutal row to its default-theme equivalent:
- Each row with unpressed BrutalShadow elements needs **16px less space above it** than the default theme provides, because the shadow fills that 16px below.
- The spacer *between* two brutal rows (each with shadows) needs **0px height** — the bottom shadow of the upper row + the top-overhang of the lower row's shadow together form the visual 32px gap.
- Formula: `brutal_spacer_height = default_gap - shadow_below_upper - shadow_above_lower`

## Constraint / width system
- `.w` = `max-width:1220px; margin:0 auto; padding:0 36px` — the single content constraint.
- `bp-outer` (brutal) replaces `.w` directly: same `max-width` and `margin:0 auto`, `padding:0`, border `1px solid #000` on all sides.
- Side strips `bp-sl` / `bp-sr` = 36px wide (matching `.w` padding), border on inner edge = the vertical constraint line.
- Never nest `bp-outer` inside `.w` — that doubles the margin.

## Border / stroke rules
- One border per line — never two adjacent borders touching the same edge.
- All strokes are `1px solid #000`, `box-sizing:border-box`.
- Spacer divs carry the border; adjacent content divs do not add their own border on the shared edge.
- Use `border-center` semantics: position borders so they sit on the boundary between two elements, owned by only one of them.

## BrutalShadow pressed state
- Pressed = face shifts bottom-right via `paddingTop:16px; paddingLeft:16px`, shadow opacity 0.
- Same total bounding box as unpressed. Use for "already pressed" elements like the badge.
- Badge ("Powered by") = `BrutalShadow pressed`, sits as a sibling in the nav-btns row.

## Theme parity
Both default and brutal themes must produce identical content widths and row heights. Visual differences (shadows, borders, side strips) must not affect the layout dimensions — they are additive/cosmetic on top of the same underlying grid.

## BrutalShadow animation

Shadow and face are one unit — shadow is a child of the face div so they translate together.

- **Click (press)**: face translates `+S` down+right via `top/left` transition. Shadow clips from `inset(0 0 0 0)` → `inset(0 S S 0)` simultaneously. Both at `150ms ease`.
- **Release**: reverses. `onMouseLeave` also resets to avoid stuck state.
- **Shadow wrapper**: `position:absolute, top:0, left:0, width:calc(100%+S), height:calc(100%+S), overflow:hidden` — sized to include shadow strips so `clip-path` has a real bounded box to clip against. `overflow:visible` breaks clip-path.
- **Key insight**: shadow must be a child of the face div, not a sibling. Siblings stay fixed in space while face moves — creates the "two things happening" artifact.
- **pressed prop** (badge/active nav): static offset only, no click animation. `opacity:0` on shadow.
