---
name: Charting New Territory
description: An editorial research archive for Digital Humanities, AI, and African Studies.
colors:
  brand-terracotta: '#e05d44'
  interactive-teal: '#0d9488'
  interactive-teal-bright: '#2dd4bf'
  warm-paper: '#fbfaf9'
  raised-paper: '#ffffff'
  warm-ink: '#1c1917'
  night: '#0c0c0d'
  night-raised: '#17171a'
typography:
  display:
    fontFamily: 'Outfit Variable, system-ui, sans-serif'
    fontSize: 'clamp(2.5rem, 2.1rem + 1.6vw, 3.5rem)'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '-0.025em'
  headline:
    fontFamily: 'Outfit Variable, system-ui, sans-serif'
    fontSize: 'clamp(1.875rem, 1.7rem + 0.9vw, 2.375rem)'
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: 'Plus Jakarta Sans Variable, system-ui, sans-serif'
    fontSize: 'clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)'
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: 'Source Serif 4 Variable, Georgia, serif'
    fontSize: 'clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)'
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: 'Plus Jakarta Sans Variable, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: '0.08em'
rounded:
  sm: '0.375rem'
  md: '0.625rem'
  card: '0.875rem'
  panel: '1.25rem'
  full: '9999px'
spacing:
  xs: 'clamp(0.5rem, 0.45rem + 0.25vw, 0.625rem)'
  sm: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)'
  md: 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)'
  lg: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)'
  xl: 'clamp(1.5rem, 1.35rem + 0.6vw, 2rem)'
  section: 'clamp(3rem, 2.5rem + 2.5vw, 4.5rem)'
components:
  button-primary:
    backgroundColor: '{colors.interactive-teal}'
    textColor: '{colors.raised-paper}'
    rounded: '{rounded.sm}'
    padding: '0.75rem 1rem'
    height: '2.75rem'
  button-ghost:
    backgroundColor: 'transparent'
    textColor: '{colors.interactive-teal}'
    rounded: '{rounded.sm}'
    padding: '0.75rem 1rem'
    height: '2.75rem'
  card:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.warm-ink}'
    rounded: '{rounded.card}'
    padding: '1.25rem'
  input:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.warm-ink}'
    rounded: '{rounded.sm}'
    padding: '0.75rem 1rem'
    height: '2.75rem'
  chip:
    backgroundColor: '#ccfbf1'
    textColor: '#0f766e'
    rounded: '{rounded.full}'
    padding: '0.375rem 0.75rem'
---

# Design System: Charting New Territory

## Overview

**Creative North Star: "The Editorial Field Atlas"**

The interface treats the workshop as a living research archive: rigorous enough for citation and long-form reading, but spatial and visual enough to invite exploration. Warm paper, restrained borders, and serif passages establish an editorial base; teal identifies interaction and terracotta supplies a rarer institutional signature.

The system is content-led rather than dashboard-like. Pages move between quiet paper surfaces, sunken archive bands, and occasional ink-dark stages. Maps, photographs, the concept network, and bibliographic records keep their own material character while sharing the same typography, spacing, focus, and color language.

**Key Characteristics:**

- Warm editorial neutrals rather than blue-gray application chrome.
- Teal for interaction, focus, and navigation; terracotta for brand emphasis.
- Tonal layering and bands before shadows.
- Dense scholarly information with comfortable reading measure and generous section rhythm.
- Dark mode as an equivalent reading environment, not a color inversion.

## Colors

The palette pairs warm stone neutrals with a clear teal interaction voice and a sparingly used terracotta signature.

### Primary

- **Field Teal**: the default link, focus, selected-control, and interactive accent.
- **Signal Teal**: the brighter dark-mode counterpart used when Field Teal would lose contrast.

### Secondary

- **Archive Terracotta**: brand moments, section emphasis, and selected states that need a second voice. It is not a general-purpose button color.

### Neutral

- **Warm Paper**: the default light canvas.
- **Raised Paper**: cards and controls on the light canvas.
- **Warm Ink**: light-mode text and the source hue for warm borders and shadows.
- **Night** and **Night Raised**: deliberately separated dark surfaces so cards remain legible without white rings.

### Named Rules

**The Two-Voice Rule.** Teal communicates interaction; terracotta communicates identity. Do not create additional accent families for individual features.

**The Contrast-Before-Consistency Rule.** Dark mode may use a brighter member of the same hue ramp when the light-mode token would fail text or control contrast.

## Typography

**Display Font:** Outfit Variable, with a system sans fallback.

**Body Font:** Plus Jakarta Sans Variable, with a system sans fallback.

**Reading Font:** Source Serif 4 Variable, with Georgia as fallback.

**Character:** Outfit gives page titles and navigation a contemporary, geometric clarity. Plus Jakarta Sans stays neutral and compact in controls, while Source Serif 4 slows the rhythm for argument, bibliography, and extended reading.

### Hierarchy

- **Display** (800, fluid 2.5–3.5rem, 1.1): one page title or major archival statement.
- **Headline** (700, fluid 1.875–2.375rem, 1.2): principal section headings.
- **Title** (600–700, fluid 1.25–1.875rem): cards, days, sessions, and local content groups.
- **Body** (400, fluid 1–1.0625rem, 1.6): interface and explanatory text.
- **Reading** (400, fluid 1–1.0625rem, 1.7): prose constrained to a 68ch measure.
- **Label** (700, 0.75rem, 0.08em tracking): terse metadata and navigational orientation, never a substitute for a heading.

### Named Rules

**The Reading-Voice Rule.** Use Source Serif only where sustained reading benefits from it; controls, metadata, maps, and filters remain sans-serif.

## Layout

Content sits in centered containers ranging from 48rem for focused reading to 80rem for maps, galleries, and multi-column archives. Inline padding and section gaps use fluid tokens, so density expands gradually rather than jumping at every breakpoint. Running text stays near 68 characters per line even inside a wide page.

Mobile layouts must use shrinkable grid tracks (`minmax(0, 1fr)`) and `min-width: 0` on content-bearing children. Horizontal scrolling is reserved for clearly bounded navigation or filter strips; page content itself must remain within the viewport. Interactive targets are at least 2.75rem on coarse pointers and on dense visual controls such as maps and graph chrome.

## Elevation & Depth

Depth is predominantly tonal. Raised paper, sunken bands, borders mixed from warm ink, and the ink stage separate content before shadows are introduced. Shadows are shallow at rest and become more visible only for overlays, hover elevation, and lightbox content.

### Shadow Vocabulary

- **Hairline lift:** a 1–2px warm shadow for sticky or raised surfaces.
- **Interactive lift:** a soft offset shadow for a hovered linked card or control.
- **Overlay depth:** broader shadows for tooltips, dialogs, and lightbox imagery.

### Named Rules

**The Tonal-First Rule.** If two adjacent surfaces are unclear, correct their tonal step or border before adding a larger shadow.

## Shapes

Controls use gently rounded 0.375rem corners, cards use 0.875rem, and large panels use 1.25rem. Pills are reserved for compact filters, counts, and transient selection summaries. Photographs remain visually primary and generally avoid card chrome. Borders are fine and warm; thick colored side rules are not part of the public-site component language.

## Components

### Buttons

- **Shape:** compact, gently rounded controls with a minimum 2.75rem target.
- **Primary:** teal surface with a contrast-checked foreground.
- **Hover / Focus:** a clear color shift plus the global 3px teal focus outline; geometry does not jump.
- **Ghost:** transparent surface with teal text, used where content should remain visually dominant.

### Chips

- **Style:** teal-tinted surface, teal text, fine accent border, and pill silhouette.
- **State:** selected chips retain text labels and do not rely on hue alone; removal controls have their own accessible names.

### Cards / Containers

- **Corner Style:** 0.875rem for ordinary cards and 1.25rem for major panels.
- **Background:** one semantic surface step above or below the surrounding band.
- **Shadow Strategy:** flat at rest unless the card is interactive; linked cards may lift subtly on hover.
- **Internal Padding:** fluid medium-to-large spacing based on content density.

### Inputs / Fields

- **Style:** raised surface, fine semantic border, persistent label, and 0.375rem radius.
- **Focus:** global teal outline plus a local border shift where useful.
- **Error / Disabled:** readable semantic text; disabled states never depend on reduced opacity alone.

### Navigation

The sticky header uses the body face, warm glass only where content passes beneath it, and one active-state treatment. Mobile navigation returns focus to its trigger when dismissed. Section navigation may scroll horizontally within its own bounded track but never expands the page grid.

### Concept Network

The graph owns a stable ink-dark stage in both themes. Canvas edges are decorative; SVG nodes retain accessible names and one roving keyboard tab stop. Arrow keys move through concepts, Enter or Space opens details, and graph motion respects the user's reduced-motion preference.

## Do's and Don'ts

### Do:

- **Do** use semantic tokens so light and dark surfaces stay equivalent.
- **Do** keep scholarly prose within the established reading measure.
- **Do** reserve wide containers for content that genuinely needs spatial breadth.
- **Do** test every new interactive component at keyboard, 390px, and dark-mode contrast states.
- **Do** give images intrinsic dimensions and preserve their real aspect ratios.

### Don't:

- **Don't** introduce a new accent hue for a route or content category.
- **Don't** animate layout-driving dimensions or ignore reduced-motion preferences.
- **Don't** turn lists of scholarly content into repetitive decorative cards without an information need.
- **Don't** use placeholder text as the only form label.
- **Don't** hide horizontal overflow to conceal a layout containment bug.
