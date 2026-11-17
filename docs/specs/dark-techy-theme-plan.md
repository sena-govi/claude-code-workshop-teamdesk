# Implementation plan: dark & techy theme

Source spec: `dark-techy-theme.md`. Theme-only, nothing in `packages/*`.

Current state: `__root.tsx:39` has `className="light"`, the init script falls back to `'auto'`, and `theme-toggle.tsx` starts with `useState("auto")`.

## Phase 1: Fonts and tokens (`apps/web/src/styles.css`), ~8 min

1. Fonts: swap the DM Sans/Newsreader `@import` for Geist + Geist Mono. Set `--font-sans`, `--font-heading`, `--font-mono`. `.display-title` gets weight ~500 with tight tracking. `.island-kicker` is Geist Mono, uppercase, small tracking.
2. Brand core: `--brand-terracotta` -> `--brand-accent` (cyan). Repurpose `--brand-paper`/`--brand-ink` as the light/dark base values. Update `--primary`, `--ring`, `--sidebar-primary`, `--chart-1`, `.nav-link::after`.
3. `.dark`: bg `#0A0D12`, card `#10151C`, border `#1E2733`, fg `#E6EDF3`, muted-fg `#8B98A9`, primary cyan `#22D3EE` with dark foreground, destructive retuned.
4. `:root`/`.light`: bg `#F6F8FA`, white cards, dark text. Use a darker cyan for accent text and `--brand-label` (>= 4.5:1). Destructive retuned.
5. Charts: cyan first, then cool neutrals.
6. Shape: `--radius: 0.25rem`. `.island-shell` keeps a 1px border and no shadow, with an optional faint `--ring` glow.

Done when: `grep -iE "terracotta|DM Sans|Newsreader"` on `styles.css` is empty.

## Phase 2: Default to dark, ~3 min

1. `routes/__root.tsx`: `<html className="dark">`. Init script fallback `'auto'` -> `'dark'` (no flash).
2. `components/theme-toggle.tsx`: `getInitialMode()` and the initial `useState` default to `"dark"`. A stored `localStorage.theme` still wins. The cycle stays auto -> light -> dark.

Done when: empty storage renders dark, and a stored choice persists across reloads.

## Phase 3: Sweep, verify, check, ~9 min

1. Review `header.tsx`, `routes/index.tsx`, `routes/bookings.tsx`, `routes/team.tsx` for hardcoded colors, terracotta or serif assumptions.
2. `bun run dev`: check home/bookings/team in dark and light. Confirm sharper corners, no DM Sans/Newsreader in the network tab, AA contrast, and that the toggle cycles and persists.
3. `bun run check` (Ultracite lint + typecheck). Fix findings.

Done when: all 7 spec acceptance criteria pass.

## Risks

- Geist source: if the `geist` package isn't a dependency, use Google Fonts (keeps the change to `styles.css`).
- Light-mode accent: bright cyan fails on white. Measure the darker step.
- `.island-shell` uses `--radius-2xl` (~0.45rem). The spec accepts this.
