# Spec: Theme enhancement (gradient, tinted sections, tooltips)

Builds on [dark-techy-theme.md](dark-techy-theme.md). Sized to build in about 20 minutes.

## Goal
Make the dark theme feel richer: a subtle background gradient, home page section cards that sit on their own tinted panels so they pop, and tooltips on nav and section links.

## Decisions (from interview)
| Topic | Decision |
|---|---|
| Background | Subtle ink-to-navy vertical gradient, **dark theme only**. Light theme unchanged |
| Section panels | Rounded tinted panels, one fixed hue per section, faint matching border |
| Panel scope | **Home page cards only** (not the section pages themselves) |
| Tooltips: where | Header nav links and home page section cards only |
| Tooltips: content | Short description of the destination |
| Tooltips: style | Existing shadcn `Tooltip` (`components/ui/tooltip.tsx`), about 300 ms delay, shows on hover and keyboard focus. On cards, the border uses the section's tint |

## Scope
Theme-only. No data, route or API changes.

### 1. Background gradient, `apps/web/src/styles.css`
- Add tokens under `.dark`: `--bg-gradient-from: #0a0d12` (the current ink) and `--bg-gradient-to: #0d1b2e` (deep navy).
- Apply to `body` in `.dark` only: `background: linear-gradient(to bottom, var(--bg-gradient-from), var(--bg-gradient-to)) fixed;` with `min-height: 100vh`. Keep `--background` as the fallback color.
- Check that the header, footer and any `bg-background` surfaces don't paint an opaque block over the gradient. Make them transparent or translucent if they do.
- Text contrast must still pass AA against the lightest point of the gradient.

### 2. Tinted section panels
- Add a tint token per section under `.dark`, plus a border token each (about 12% fill, about 30% border). Starting values:

| Section | Hue | Fill | Border |
|---|---|---|---|
| Team | indigo | `rgb(99 102 241 / 0.12)` | `rgb(99 102 241 / 0.30)` |
| Rooms | teal | `rgb(20 184 166 / 0.12)` | `rgb(20 184 166 / 0.30)` |
| Bookings | violet | `rgb(139 92 246 / 0.12)` | `rgb(139 92 246 / 0.30)` |
| Tasks | amber | `rgb(245 158 11 / 0.12)` | `rgb(245 158 11 / 0.30)` |

- Notes (slate) and About (sky) have no home card today. Define their tokens now, but don't use them yet.
- `apps/web/src/routes/index.tsx`: add a `tint` key to each entry in `pages`. Replace the `border-t pt-5` article styling with a rounded panel (`rounded-xl border p-5`, using the tint's fill and border). Keep the `rise-in` animation and stagger.
- Panel text keeps `text-foreground` and `text-muted-foreground`. Check the contrast on each tint.
- Light theme: panels fall back to the current card look (no tint).

### 3. Tooltips
- Wrap the app (or the header and home page) in `TooltipProvider` with `delayDuration={300}`. Use the single provider in `__root.tsx` if one doesn't already exist.
- `apps/web/src/components/header.tsx`: wrap each nav `Link` in `Tooltip`/`TooltipTrigger asChild`/`TooltipContent`.

| Link | Tooltip text |
|---|---|
| Home | Back to the start |
| About | What Teamdesk is |
| Notes | Shared team notes |
| Team | See who is on the team |
| Rooms | Meeting rooms and their seats |
| Bookings | Book a room and see your bookings |
| Tasks | Shared jobs and due dates |

- Home page cards: the tooltip trigger is the card title `Link`. The text is a short action phrase, for example "Open Team". The border color comes from the card's tint token.
- Don't add tooltips to the external docs link, footer, list items or other links in the app.
- Tooltips must open on keyboard focus as well as hover. They must not trap focus or stay stuck open on touch devices.

## Out of scope
- Light theme gradient or tints.
- Tints on the section pages (`/team`, `/rooms` and so on).
- Tooltips on links outside the header and home cards.
- Any behavior, data or routing change.

## Acceptance checks
1. Dark mode shows a smooth gradient with no hard seams behind the header or footer. Light mode looks the same as before.
2. The four home cards each show a distinct tint with a faint border. Text passes AA.
3. Hovering or tabbing to any nav link or home card title shows its tooltip after about 300 ms. It hides on blur or mouse leave.
4. `bun run check` passes.
