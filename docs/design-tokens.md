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

## Field borders (an accessibility trade-off)

Text fields, selects, searchable and multi selects, date pickers, search boxes and Bootstrap form controls take their edge
from `--fx-field-border` (and `-hover`, `-focus`, `-disabled`), and their focus look from `--fx-field-focus-glow` and
`--fx-field-focus-outline`. All are plain neutral greys, set per theme:

| Theme | Rest | Hover | Focus | Disabled | Focus glow |
| --- | --- | --- | --- | --- | --- |
| Light | `#dcdcdc` (1.37:1 on white) | `#cfcfcf` (1.56:1) | `#bdbdbd` (1.88:1) | `#e8e8e8` | `0 0 0 3px rgba(128,128,128,.25)` |
| Dark | `#3f3f3f` (1.72:1 on the dark field) | `#4a4a4a` (2.05:1) | `#5c5c5c` (2.71:1) | `#333333` | `0 0 0 3px rgba(160,160,160,.25)` |
| High contrast | strong border, unchanged | | | | the strong focus ring, unchanged |

**Deliberate exception:** WCAG 1.4.11 asks for 3:1 between a field's boundary and its background, and the app gives
every focusable control a 2px navy (orange on dark) ring. The owner chose a softer look for fields, so in Light and Dark:

- field borders stay light grey in every state, below 3:1;
- a focused field shows the grey glow and a slightly darker grey border instead of the dark ring (the outline is
  transparent, not removed, so Windows high-contrast mode still draws one);
- everything that is not a text field (buttons, links, checkboxes, radios, menus, tabs) keeps the strong ring at 3:1 or
  more;
- error borders stay red;
- the High contrast theme keeps strong field edges and the ring, for anyone who needs them.

How it is wired: a zero-specificity rule in `tokens.scss` gives native inputs, selects and textareas the glow;
components use `@include m.field-focus-ring` (not `m.focus-ring`) on their field triggers, and field `:focus` /
`:focus-within` rules use `var(--fx-field-border-focus)` and `var(--fx-field-focus-glow)`. A new field should do the same.

`tests/visual/field-borders.spec.ts` checks exactly this: soft grey at rest and on focus, the grey glow, no dark outline on
a field, and a ring of 3:1 or more on a button. To go back to compliant fields, set Light rest to `#949494` and Dark rest
to `#636363`, and point `--fx-field-focus-outline` at `2px solid var(--fx-focus-ring)` in `_themes.scss` / `tokens.scss`.

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
- Inside a field: the chevron, the calendar and the clear "x" are all `size={14}` with `strokeWidth={ICON_STROKE_FINE}` (1.5),
  coloured `--fx-field-icon` (`#8a93a0` in Light, 3.1:1; darker `--fx-field-icon-hover` on hover). The clear "x" is the
  shared `FieldClear` (`shared/components/dropdown`), a 24px click area that stops the click from opening the dropdown.
  A chip's remove "x" is `size={12}` in an 18px area. Never put `role="button"` on an `<svg>`: the 24px minimum target
  rule then stretches the icon itself.
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
