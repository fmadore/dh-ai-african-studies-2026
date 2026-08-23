---
name: Charting New Territory
description: An editorial research archive for Digital Humanities, AI, and African Studies.
colors:
  interactive-teal: '#0d9488'
  interactive-teal-deep: '#0f766e'
  interactive-teal-darker: '#115e59'
  interactive-teal-abyss: '#134e4a'
  interactive-teal-muted: '#14b8a6'
  interactive-teal-bright: '#2dd4bf'
  interactive-teal-light: '#5eead4'
  interactive-teal-pale: '#99f6e4'
  interactive-teal-tint: '#ccfbf1'
  interactive-teal-wash: '#f0fdfa'
  brand-terracotta: '#e05d44'
  brand-terracotta-deep: '#c23a24'
  brand-terracotta-strong: '#a12b18'
  brand-terracotta-darkest: '#852516'
  brand-terracotta-bright: '#ff5d42'
  brand-terracotta-light: '#ff9480'
  brand-terracotta-soft: '#fff0ed'
  warm-paper: '#fbfaf9'
  raised-paper: '#ffffff'
  sunken-paper: '#f5f4f2'
  warm-line: '#e8e6e3'
  warm-rule: '#d6d3ce'
  stone-mute: '#a8a29e'
  stone-subtle: '#8d8681'
  stone-print: '#78716c'
  stone-graphite: '#57534e'
  stone-slate: '#44403c'
  warm-charcoal: '#292524'
  warm-ink: '#1c1917'
  warm-ink-deep: '#0c0a09'
  night: '#0c0c0d'
  night-raised: '#17171a'
  night-sunken: '#202024'
  night-overlay: '#1c1c1f'
  night-ink: '#000000'
  status-warning: '#d97706'
  status-warning-bright: '#f59e0b'
  status-warning-wash: '#fef3c7'
  status-warning-deep: '#78350f'
  status-danger: '#dc2626'
  status-danger-bright: '#ef4444'
  status-danger-deep: '#b91c1c'
  signal-amber: '#fbbf24'
  signal-coral: '#f87171'
  graph-mint: '#34d399'
  graph-slate: '#94a3b8'
  graph-violet: '#a78bfa'
  graph-label: '#e8ecf1'
  graph-edge: '#9aa8bd'
typography:
  display:
    fontFamily: 'Outfit Variable, system-ui, sans-serif'
    fontSize: 'clamp(2.5rem, 2.1rem + 1.6vw, 3.5rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Outfit Variable, system-ui, sans-serif'
    fontSize: 'clamp(1.875rem, 1.7rem + 0.9vw, 2.375rem)'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'Outfit Variable, system-ui, sans-serif'
    fontSize: 'clamp(1.5rem, 1.38rem + 0.6vw, 1.875rem)'
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: 'Plus Jakarta Sans Variable, system-ui, sans-serif'
    fontSize: 'clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)'
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: 'Source Serif 4 Variable, Georgia, serif'
    fontSize: 'clamp(1.125rem, 1.08rem + 0.25vw, 1.25rem)'
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Plus Jakarta Sans Variable, system-ui, sans-serif'
    fontSize: 'clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)'
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '0.05em'
rounded:
  sm: '0.375rem'
  md: '0.625rem'
  card: '0.875rem'
  panel: '1.25rem'
  full: '9999px'
spacing:
  2xs: 'clamp(0.375rem, 0.35rem + 0.15vw, 0.5rem)'
  xs: 'clamp(0.5rem, 0.45rem + 0.25vw, 0.625rem)'
  sm: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)'
  md: 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)'
  lg: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)'
  xl: 'clamp(1.5rem, 1.35rem + 0.6vw, 2rem)'
  2xl: 'clamp(2rem, 1.8rem + 1vw, 2.5rem)'
  section-tight: 'clamp(2.5rem, 2.2rem + 1.5vw, 3.5rem)'
  section: 'clamp(3rem, 2.5rem + 2.5vw, 4.5rem)'
  section-loose: 'clamp(4rem, 3.3rem + 3.5vw, 6rem)'
components:
  button-primary:
    backgroundColor: '{colors.brand-terracotta-strong}'
    textColor: '{colors.raised-paper}'
    rounded: '{rounded.card}'
    padding: '0.75rem 1.25rem'
    height: '2.75rem'
  button-primary-hover:
    backgroundColor: '{colors.brand-terracotta-darkest}'
    textColor: '{colors.raised-paper}'
  button-secondary:
    backgroundColor: 'transparent'
    textColor: '{colors.interactive-teal-deep}'
    rounded: '{rounded.card}'
    padding: '0.75rem 1.25rem'
    height: '2.75rem'
  card:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.warm-ink}'
    rounded: '{rounded.card}'
    padding: '1.25rem'
  panel:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.warm-ink}'
    rounded: '{rounded.panel}'
    padding: '1.5rem'
  input:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.warm-ink}'
    rounded: '{rounded.sm}'
    padding: '0.75rem 1rem'
    height: '2.75rem'
  input-search:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.warm-ink}'
    rounded: '{rounded.panel}'
    padding: '0.75rem 1rem 0.75rem 3rem'
  chip:
    backgroundColor: '{colors.interactive-teal-tint}'
    textColor: '{colors.interactive-teal-deep}'
    rounded: '{rounded.full}'
    padding: '0.375rem 0.75rem'
  count-pill:
    backgroundColor: '{colors.interactive-teal-tint}'
    textColor: '{colors.interactive-teal-deep}'
    rounded: '{rounded.sm}'
    padding: '0 0.375rem'
  nav-link:
    backgroundColor: 'transparent'
    textColor: '{colors.stone-slate}'
    rounded: '{rounded.md}'
    padding: '0.5rem 0.75rem'
    height: '2.75rem'
---

# Design System: Charting New Territory

## Overview

**Creative North Star: "The Editorial Field Atlas"**

The interface treats the workshop as a living research archive: rigorous enough for citation and long-form reading, but spatial and visual enough to invite exploration. Warm paper, restrained borders, and serif passages establish an editorial base; teal identifies interaction and terracotta supplies a rarer institutional signature.

The system is content-led rather than dashboard-like. Pages move between quiet paper surfaces, sunken archive bands, and occasional ink-dark stages. Maps, photographs, the concept network, and bibliographic records keep their own material character while sharing the same typography, spacing, focus, and color language.

Its neutrals are a full warm stone ramp rather than a handful of greys, and both accents ship as complete ten-step and seven-step ramps: the ramps exist because dark mode is a second reading environment with its own contrast arithmetic, not a filter over the first. Nothing outside those ramps enters a page except the concept network's categorical set and the status tones.

**Key Characteristics:**

- Warm editorial neutrals rather than blue-gray application chrome.
- Teal for interaction, focus, and navigation; terracotta for brand emphasis and calls to action.
- Tonal layering and bands before shadows.
- Dense scholarly information with comfortable reading measure and generous section rhythm.
- Dark mode as an equivalent reading environment, not a color inversion.

## Colors

The palette pairs a warm stone neutral ramp with a clear teal interaction voice and a sparingly used terracotta signature.

### Primary

The teal ramp carries every interactive meaning: links, focus, selection, selected controls, accent rules and tints.

- **Field Teal** (`interactive-teal`): the accent alias, the focus outline, and the selected schedule-tab family's lighter end.
- **Field Teal Deep** (`interactive-teal-deep`): the light-mode link and accent text tone, and the selected tab fill — a darker step than the accent because link text has to clear body-copy contrast.
- **Field Teal Darker / Abyss** (`interactive-teal-darker`, `interactive-teal-abyss`): the hovered link, the brand monogram's gradient end, and the light-mode selection foreground.
- **Muted Teal** (`interactive-teal-muted`): the lighter end of the accent-rule gradient and the shared dark/light `accent-muted` alias.
- **Signal Teal** (`interactive-teal-bright`): the dark-mode accent, and one of the concept network's categorical tones.
- **Signal Teal Light / Pale** (`interactive-teal-light`, `interactive-teal-pale`): dark-mode links, dark-mode focus outline, and the ink band's accent text.
- **Teal Tint / Wash** (`interactive-teal-tint`, `interactive-teal-wash`): soft accent fills — chips, facet count pills — and the dark-mode selection foreground.

### Secondary

Terracotta is the institutional voice and the call-to-action fill. It is not a general-purpose interface color.

- **Archive Terracotta** (`brand-terracotta`): the brand tone itself; brand emphasis, the warm counterweight in the hero gradient, the dark-mode `brand-muted`.
- **Terracotta Strong / Darkest** (`brand-terracotta-strong`, `brand-terracotta-darkest`): the primary button's rest and hover fills.
- **Terracotta Deep** (`brand-terracotta-deep`): the light-mode `brand` alias used by `.link-primary` and by `accent-color` on native controls.
- **Terracotta Bright / Light** (`brand-terracotta-bright`, `brand-terracotta-light`): dark-mode brand text and the monogram's punctuation dot, where the deep steps go muddy on near-black.
- **Terracotta Soft** (`brand-terracotta-soft`): the light-mode soft brand fill.

### Tertiary

The concept network paints on its own dark stage and therefore owns one categorical set, measured against that stage rather than against either page theme.

- **Graph Mint, Graph Slate, Graph Violet** (`graph-mint`, `graph-slate`, `graph-violet`): three of the six thematic-group tones; the other three reuse Signal Teal, Signal Amber, and Signal Coral.
- **Graph Label / Graph Edge** (`graph-label`, `graph-edge`): node labels and edges, both measured against the same stage.
- **Signal Amber / Signal Coral** (`signal-amber`, `signal-coral`): dual-role tones — a concept-group color on the graph stage, and the dark-mode warning-on-soft and danger-hover tones in the interface.

### Neutral

- **Warm Paper** (`warm-paper`): the default light canvas, and the inverse text tone on ink.
- **Raised Paper** (`raised-paper`): cards, panels and controls on the light canvas; also the on-accent foreground.
- **Sunken Paper** (`sunken-paper`): the recessed band and the hero gradient's base.
- **Warm Line / Warm Rule** (`warm-line`, `warm-rule`): the light-mode overlay fill and the ramp step borders and dividers are mixed toward.
- **Stone Mute / Stone Subtle / Stone Print** (`stone-mute`, `stone-subtle`, `stone-print`): disabled text, the dark-mode subtle tone (a half-step that exists so small text still clears AA on near-black), and the print stylesheet's body grey.
- **Stone Graphite** (`stone-graphite`): the light-mode muted and subtle text tone — every page-hero eyebrow, caption and credit line.
- **Stone Slate / Warm Charcoal** (`stone-slate`, `warm-charcoal`): secondary text and the darkest interface fills before ink.
- **Warm Ink / Warm Ink Deep** (`warm-ink`, `warm-ink-deep`): light-mode text, the ink band's surface, the hue that borders and shadows are mixed from, and the scrim source.
- **Night, Night Raised, Night Sunken, Night Overlay, Night Ink** (`night`, `night-raised`, `night-sunken`, `night-overlay`, `night-ink`): the dark theme's five deliberately separated steps, so a card reads as a card without a white hairline ring.

### Status

- **Warning** (`status-warning`, `status-warning-bright`, `status-warning-wash`, `status-warning-deep`): advisory notices; the wash and deep pair is the light-mode soft badge.
- **Danger** (`status-danger`, `status-danger-bright`, `status-danger-deep`): destructive or removal controls, and their hovers.

### Named Rules

**The Two-Voice Rule.** Teal communicates interaction; terracotta communicates identity and the primary call to action. Do not create additional accent families for individual features. The concept network's categorical set is the single sanctioned exception, and it never leaves the graph stage.

**The Contrast-Before-Consistency Rule.** Dark mode may use a brighter member of the same hue ramp when the light-mode token would fail text or control contrast. This is why the ramps exist; a token that only ever resolves to one value does not need one.

## Typography

**Display Font:** Outfit Variable, with a system sans fallback.

**Body Font:** Plus Jakarta Sans Variable, with a system sans fallback.

**Reading Font:** Source Serif 4 Variable, with Georgia as fallback.

All three are self-hosted variable faces bundled with the application — no third-party font request is made at runtime.

**Character:** Outfit gives page titles and navigation a contemporary, geometric clarity. Plus Jakarta Sans stays neutral and compact in controls, while Source Serif 4 slows the rhythm for argument, bibliography, and extended reading.

### Hierarchy

The ramp is fluid throughout (a ~1.2 minor third opening to a major third), with the top two steps deliberately tamer than a pure ratio: at a full ratio the single page title and the many section headings below it sat close enough to read as one size.

- **Display** (800, fluid 2.5–3.5rem, 1.1, −0.02em): one page title or major archival statement per page.
- **Headline** (700, fluid 1.875–2.375rem, 1.15, −0.02em): principal section headings.
- **Title** (600, fluid 1.5–1.875rem, 1.15): cards, days, sessions, and local content groups.
- **Body** (400, fluid 1–1.0625rem, 1.6): interface and explanatory text.
- **Reading** (400, fluid 1.125–1.25rem, 1.65): prose constrained to a 68ch measure; the small reading variant drops to body size at 1.6, and the lede runs one step larger at a 46ch measure.
- **Label** (600, fluid 0.75–0.8125rem, 0.05em tracking, uppercase): terse metadata, section eyebrows, and navigational orientation — never a substitute for a heading.

### Named Rules

**The Reading-Voice Rule.** Use Source Serif only where sustained reading benefits from it: running prose, ledes, bios, the bibliography. Controls, metadata, maps, filters, timetable chrome, and navigation stay on the body sans.

## Layout

Content sits in centered containers ranging from 48rem for focused reading through 64rem for the default page to 80rem for maps, galleries, and multi-column archives. Inline padding and section gaps use fluid tokens, so density expands gradually rather than jumping at every breakpoint. Running text stays near 68 characters per line even inside a wide page; ledes cap at 46 and captions at 42.

Vertical rhythm comes from bands, not from floating slabs: a plain band, a tight band, a recessed band, an ink band, and a full-bleed variant. One recessed band and one ink band per long page. Grids are auto-fit with a 15rem, 20rem, or 25rem minimum track.

The three breakpoints in use are 640px, 768px, and 1024px. Mobile layouts must use shrinkable grid tracks (`minmax(0, 1fr)`) and `min-width: 0` on content-bearing children. Horizontal scrolling is reserved for clearly bounded navigation or filter strips; page content itself must remain within the viewport. Interactive targets are at least 2.75rem on coarse pointers and on dense visual controls such as maps and graph chrome; text-only controls get a 44px minimum hit area, and dense chip rows are compact on a mouse and 44px on touch.

## Elevation & Depth

Depth is predominantly tonal. Raised paper, sunken bands, borders mixed from warm ink, and the ink stage separate content before shadows are introduced. The shadow set is one family, warm-tinted in light mode and pure black in dark mode, and deliberately shallow: shadows are shallow at rest and become more visible only for overlays, hover elevation, and lightbox content.

### Shadow Vocabulary

- **Hairline lift** (`--shadow-xs`, `--shadow-sm`): a 1–2px warm shadow for sticky or raised surfaces, cards at rest, and buttons at rest.
- **Interactive lift** (`--shadow-md`): a soft offset shadow for a hovered linked card or control, paired with a 2px translate.
- **Overlay depth** (`--shadow-lg`, `--shadow-xl`): broader shadows for tooltips, dialogs, and lightbox imagery.

### Named Rules

**The Tonal-First Rule.** If two adjacent surfaces are unclear, correct their tonal step or border before adding a larger shadow.

**The Neutral-Elevation Rule.** Elevation is neutral. A shadow describes distance from the surface below it, never hue; do not reach for a colored glow to signal state when a tonal step, a border shift, or the focus outline already says it.

## Shapes

Controls use gently rounded 0.375rem corners, cards use 0.875rem, and large panels use 1.25rem — controls < cards < panels, a deliberate step down from a larger panel radius that at 1280px wide read as a consumer app card rather than an academic surface. Pills are reserved for compact filters, counts, and transient selection summaries; the search field is the one input that takes the panel radius, because it reads as a surface rather than a control. Photographs remain visually primary and generally avoid card chrome. Borders are fine and warm — mixed from warm ink at 7%, 12%, and 20% in light mode, and from white at 8%, 13%, and 22% in dark. Thick colored side rules are not part of the public-site component language; the one sanctioned rule is the 2.5rem × 2px teal gradient bar under a section header.

## Components

### Buttons

- **Shape:** compact, card-radius controls (0.875rem) with a minimum 2.75rem target.
- **Primary:** terracotta fill with white text — the call-to-action voice, one or two per page.
- **Hover / Focus:** a 1px lift, a darker terracotta fill, and the global 3px teal focus outline; geometry does not jump and the button never changes size.
- **Secondary:** teal outline and teal text on a transparent surface, used where content should remain visually dominant.

### Chips

- **Style:** teal-tinted surface, deep teal text, fine accent border, and pill silhouette. The facet count pill is the same fill at control radius.
- **State:** selected chips retain text labels and do not rely on hue alone; removal controls have their own accessible names.

### Cards / Containers

- **Corner Style:** 0.875rem for ordinary cards and 1.25rem for major panels.
- **Background:** one semantic surface step above or below the surrounding band.
- **Shadow Strategy:** flat at rest — hairline lift only. Static by default; only the opt-in link variant lifts 2px and warms its border on hover or focus-within, because hover feedback on a non-target is a false affordance.
- **Border:** a single subtle hairline; the empty state is the same silhouette with a dashed strong border and no fill.
- **Internal Padding:** fluid medium-to-large spacing based on content density.

### Inputs / Fields

- **Style:** raised surface, fine semantic border, persistent label, and 0.375rem radius; the standalone search field takes the panel radius and a leading icon.
- **Focus:** global teal outline plus a local accent border shift.
- **Error / Disabled:** readable semantic text from the status ramp; disabled states use an explicit disabled token, never compounded opacity.

### Navigation

The sticky header uses the body face and a typographic monogram — a teal gradient tile with a terracotta dot — rather than an image mark. Glass appears only here and in the lightbox chrome, the two surfaces that genuinely overlap moving content; everywhere else panels are solid. Nav links are medium-weight small text at control radius with a 2.75rem target, one active-state treatment, and a sunken hover fill. Mobile navigation returns focus to its trigger when dismissed. Section navigation may scroll horizontally within its own bounded track but never expands the page grid.

### Concept Network

The graph owns a stable ink-dark stage in both themes, and one palette rather than a light/dark pair — the tones are measured against that stage, and every one of them clears 7:1 against it. Canvas edges are decorative; SVG nodes retain accessible names and one roving keyboard tab stop. Arrow keys move through concepts, Enter or Space opens details, and graph motion respects the user's reduced-motion preference. The page-level dot mesh is switched off here.

### Ambient Field

One dot mesh per page, a single fixed pseudo-element on the app shell, masked to fade out by 65% of the viewport. The radial glow is the homepage hero's alone. Motion is orchestrated rather than ambient: hero elements enter on a 60/180/240ms cascade, sections fade up 16px on scroll, and staggered children sequence for six steps before the remainder joins the tail — enumerating more meant a 28-card grid held its last rows and dropped them in together.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens so light and dark surfaces stay equivalent.
- **Do** keep scholarly prose within the established reading measure.
- **Do** reserve wide containers for content that genuinely needs spatial breadth.
- **Do** test every new interactive component at keyboard, 390px, and dark-mode contrast states.
- **Do** give images intrinsic dimensions and preserve their real aspect ratios.
- **Do** reach for a ramp step that clears contrast in the target theme rather than reusing the light-mode token and accepting the miss.

### Don't:

- **Don't** introduce a new accent hue for a route or content category.
- **Don't** animate layout-driving dimensions or ignore reduced-motion preferences.
- **Don't** turn lists of scholarly content into repetitive decorative cards without an information need.
- **Don't** use placeholder text as the only form label.
- **Don't** hide horizontal overflow to conceal a layout containment bug.
- **Don't** signal state with a colored glow when a tonal step, a border shift, or the focus outline already carries it.
- **Don't** spend the gradient title anywhere but the homepage h1; nine gradient page titles turn a signature into wallpaper.
