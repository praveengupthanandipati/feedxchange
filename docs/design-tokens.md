# Design tokens, themes and icons

The admin app and the public website share one set of design tokens. Every colour, font, spacing step, radius and shadow is a
CSS custom property (`--fx-*`) on `<html>`, so a theme can change all of them at runtime.

## Where things live

| File | What it holds |
| --- | --- |
| `src/shared/assets/styles/_palette.scss` | Every colour, as the Light theme shows it. Names are `<hue family>-<HSL lightness>` (`slate-50`, `green-94`), plus `brand-navy` and `brand-orange`. `$shades` lists the darker hover steps. |
| `src/shared/assets/styles/_themes.scss` | How each theme derives its colours from the palette, the non-colour tokens (type, spacing, radius, shadows, density, charts, focus ring) and the Bootstrap mapping. |
| `src/shared/assets/styles/tokens.scss` | Places the tokens: `:root` (Light), `[data-theme="dark"]`, `[data-theme="high-contrast"]`, the dark brand panels, Bootstrap component overrides. Imported once in `main.tsx`. |
| `src/shared/assets/styles/_functions.scss` | `alpha()`, `shade()`, `fg()`, `line()`, `on()`, `token()`. |
| `src/shared/assets/styles/_variables.scss` | The admin app's SCSS API (`v.$color-primary`, `v.$spacing-4` ...), now holding `var(--fx-...)`. |
| `src/features/website/styles/_variables.scss` | The website's SCSS API (`v.$navy-900`, `v.$ink` ...), pointing at the same tokens. |

## Writing styles

Use the SCSS variables as before. Because they hold `var(...)`, Sass cannot compute with them:

| Instead of | Write |
| --- | --- |
| `rgba(v.$color-navy, 0.12)` | `v.alpha(v.$color-navy, 0.12)` (plain CSS: `rgba(var(--fx-brand-navy-rgb), 0.12)`) |
| `darken(v.$color-danger, 8%)` | `v.shade(v.$color-danger, 8%)` (the step must be listed in `$shades`) |
| a hex colour | a palette token: `var(--fx-green-40)`, or `v.token("green-40")` in Sass; add new colours to `_palette.scss` first |

Each colour has variants for its job, because a theme tunes them differently:

| Property | Use | Example |
| --- | --- | --- |
| backgrounds, fills, shadows | the colour itself | `background: v.$color-gray-100` |
| `color`, `fill`, `stroke` (text and icons) | `v.fg(...)` | `color: v.fg(v.$color-text-muted)` |
| `border`, `outline` | `v.line(...)` | `border: 1px solid v.line(v.$color-border)` |
| text on a brand fill (a button, a navy header) | `v.on(...)` | `color: v.on(v.$color-white)` |

In plain CSS the same are `var(--fx-<name>)`, `var(--fx-<name>-fg)`, `var(--fx-<name>-line)`, `var(--fx-<name>-on)`, and
`rgba(var(--fx-<name>-rgb), a)`. Focus rings use `@include m.focus-ring` (colour from `--fx-focus-ring`).

Charts take `var(--fx-chart-1)` ... `var(--fx-chart-5)`, `var(--fx-chart-grid)` and `var(--fx-chart-axis)` as fill/stroke values.

## Density

Every size is in `rem`, and the root size sets the density for everything at once (`tokens.scss`): 13px in the admin app
(`<html data-app="admin">`), 14px on the website, as percentages so a larger browser font still counts. Touch screens
(`pointer: coarse`) get 15px / 16px, so controls stay about 36px high, and inputs use 16px text so phones do not zoom.

| Token | Admin app | Use |
| --- | --- | --- |
| `--fx-control-height` | 2.25rem, about 29px | buttons, inputs, selects, icon buttons |
| `--fx-control-height-sm` / `-lg` | about 24px / 32px | small and large variants |
| `--fx-table-cell-py` / `-px` | about 6px / 10px | table cells (rows about 31px) |
| `--fx-card-padding` | about 12px | `@include m.card` |
| `--fx-dialog-padding` | about 16px | modals and offcanvas |

- No text is smaller than 11px: write small text as `max(11px, 0.75rem)` (or `var(--fx-text-xs)`).
- Anything you can press is at least 24px (buttons 24 x 24): a zero-specificity rule in `tokens.scss` lifts smaller ones.
- A side list beside a detail panel (`@include m.side-panel`): fills the visible height and scrolls inside, as the
  notification preferences finder and the price history sellers list do.
- `tests/visual/layout.spec.ts` checks every screen at every width: no sideways page scroll, no text under 11px; small
  targets are listed in `test-results/layout/`.

## Themes

| Choice | What it does |
| --- | --- |
| Light (default) | The FeedXchange brand. Text colours that would fail WCAG AA on white are darkened just enough to pass. |
| Dark | Light surfaces and pale tints turn dark, text turns light, brand fills (buttons, the navy sidebar) stay. |
| High contrast | White page, near-black text, deep status colours, strong borders, black focus ring. |
| Match my device | Dark or Light from the device setting, High contrast when the device asks for more contrast. |

- The choice is stored per browser (`localStorage["fx-theme"]`). The inline script in `index.html` applies it before the first
  paint; `src/shared/theme/theme.ts` keeps it in step afterwards (device changes, other tabs, the desktop window frame).
- Pickers: the admin header (hidden on phones), Settings, the website header (in the off-canvas menu on phones).
  Component: `src/shared/theme/ThemePicker.tsx` (`variant="menu"` or `"list"`).
- Dark brand panels (sidebar, website hero, dark sections, footer ...) keep their designed text colours in Light and High
  contrast. A new dark panel goes in the `$dark-panels` list in `tokens.scss`.
- A new theme: add its rules to `theme-colour()` in `_themes.scss`, a `[data-theme="..."]` block in `tokens.scss`, and a
  choice in `theme.ts` and the `index.html` script.

## Icons

Icons come from Lucide through one wrapper: `import { TruckIcon } from ".../shared/components/icon"`.

- Sizes: `size={16}` dense UI, `20` controls and menus, `24` headers and empty states; the default `1em` follows the text.
- Stroke 2px everywhere. Decorative (`aria-hidden`) unless the icon has an `aria-label` or `title`.
- A new icon: add the Lucide glyph and one line to `src/shared/components/icon/icons.ts`.
- Menu icons stored in the database keep their Feather names (`FiTruck`); `layouts/admin-layout/asidemenu/iconMap.ts`
  maps them. Lucide has no brand logos, so Facebook, Instagram, LinkedIn and Twitter keep their Feather glyphs.

## Checks

`npm run test:visual` builds the app and runs, against stubbed API data:

- `tests/visual/screens.spec.ts`: 20 screens x 3 widths in Light;
- `tests/visual/themes.spec.ts`: 10 key screens x phone and desktop in Dark and High contrast, plus "Match my device"
  and the no-flash check;
- `tests/visual/contrast.spec.ts`: axe-core WCAG AA text contrast, all 20 screens in Light and the 10 key screens in the other
  themes (failures listed in `test-results/contrast/`).
