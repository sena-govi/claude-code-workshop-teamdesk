# Spec: Dark & techy theme

## Goal
Replace the Claude-style look (terracotta on warm paper, DM Sans + Newsreader serif, soft 0.75rem corners) with a dark, techy look: near-black surfaces, electric cyan accent, Geist sans body with Geist Mono accents, sharp corners.

## Decisions (from interview)
| Topic | Decision |
|---|---|
| Mood | Dark & techy |
| Accent | Electric cyan (~`#22D3EE`) |
| Fonts | Geist (body) + Geist Mono (headings, labels, data/eyebrows) |
| Themes | Dark is the default. Keep the existing light / dark / auto toggle; light is restyled with the same cyan accent |
| Shape | Sharp: `--radius: 0.25rem` (was 0.75rem) |

## Scope
Theme-only. No behavior, data, route or API changes. Almost everything is driven by tokens in `apps/web/src/styles.css`.

### 1. Fonts, `apps/web/src/styles.css`
- Replace the Google Fonts `@import` (DM Sans, Newsreader) with Geist and Geist Mono (Google Fonts, or the `geist` package if already a dependency).
- `--font-sans`: `"Geist", ui-sans-serif, system-ui, sans-serif`.
- `--font-heading`: `"Geist Mono", ui-monospace, monospace`. `.display-title` keeps using it. Change its weight to about 500 and keep the tight letter-spacing.
- `--font-mono` is Geist Mono, so inline `code` matches.
- `.island-kicker` (eyebrow) uses Geist Mono, uppercase, small tracking.

### 2. Color tokens, `apps/web/src/styles.css`
- Rename or repurpose the `--brand-*` core: `--brand-terracotta` becomes `--brand-accent` (cyan). `--brand-paper` and `--brand-ink` become the light and dark base values. Update every reference (`--primary`, `--ring`, `--sidebar-primary`, `--chart-1`, `.nav-link::after`).
- `.dark` (default): background about `#0A0D12`, card about `#10151C`, border about `#1E2733`, foreground about `#E6EDF3`, muted-foreground about `#8B98A9`. `primary` is cyan with dark `primary-foreground`.
- `:root` / `.light`: cool off-white background (about `#F6F8FA`), white cards, dark text. Use a darker cyan step for accent text and `--brand-label` so it passes WCAG AA (4.5:1). The bright cyan fails on white.
- Keep `--destructive` red, retuned for dark.
- Chart tokens: cyan first, then cool neutrals.
- Cards and panels (`.island-shell`): keep the 1px border, no shadow. Optionally add a faint cyan glow on hover or focus (`--ring`).

### 3. Shape
- `--radius: 0.25rem`. The derived `--radius-*` scale follows automatically.
- `.island-shell` uses `--radius-2xl`, which becomes about 0.45rem. This is acceptable.

### 4. Default theme
- `apps/web/src/routes/__root.tsx`:
  - `<html className="light">` becomes `className="dark"`.
  - `THEME_INIT_SCRIPT`: when nothing is stored, resolve to `dark`, not `auto`.
- `apps/web/src/components/theme-toggle.tsx`: `getInitialMode()` and the initial `useState` default to `"dark"`. A stored user choice (`localStorage.theme`) still wins. The cycle stays auto → light → dark.

### 5. Hardcoded styling to check
These files reference `font-heading`, `brand-label` or terracotta. Verify they look right and fix any hardcoded color or serif assumption:
- `apps/web/src/components/header.tsx`
- `apps/web/src/routes/index.tsx`
- `apps/web/src/routes/bookings.tsx`
- `apps/web/src/routes/team.tsx`

## Out of scope
New components, layout changes, logo or illustration changes, new themes beyond light/dark, animations beyond the existing ones, any `packages/*` change.

## Acceptance criteria
1. A first visit with empty localStorage renders dark with a cyan accent, with no flash of the light theme.
2. Body text is Geist. Headings, eyebrows and `code` are Geist Mono. No DM Sans or Newsreader loads (check the network tab).
3. No terracotta or warm-paper color remains in either theme.
4. Light mode is usable. Text and accent contrast meet WCAG AA in both themes.
5. Corners are visibly sharper on buttons, inputs, cards and toasts.
6. The theme toggle still cycles auto / light / dark, and the choice persists across reloads.
7. `bun run check` passes.

## Build plan (about 20 min)
1. Fonts and tokens in `styles.css` (about 8 min).
2. Default-to-dark change in `__root.tsx` and `theme-toggle.tsx` (about 3 min).
3. Run `bun run dev` and check home, bookings and team pages in dark and light. Fix leftovers in the four files above (about 7 min).
4. `bun run check` (about 2 min).
