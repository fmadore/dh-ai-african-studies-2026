# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static conference website for "Charting New Territory: Digital Humanities and AI in African Studies" (18-20 February 2026, Hanover, Germany). Funded by Volkswagen Foundation.

The workshop has taken place: the site is now a post-event archive (photos, interviews, concept map, position paper). Write copy in past tense; treat outcome pages as the primary content.

**Live Site:** https://fmadore.github.io/dh-ai-african-studies-2026/

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build to /build
npm run preview      # Preview production build
npm run check        # TypeScript type checking
npm run lint         # ESLint
npm run format       # Format all files with Prettier
npm run format:check # Verify formatting (used in CI)
```

**Update references from Zotero:**

```bash
npm run fetch:references
```

Requires `ZOTERO_API_KEY` in `.env` file (see `.env.example`).

**Optimize images after adding any to `static/images/`:**

```bash
npm run optimize:images
```

**Work on the (unpublished) position paper reader:**

```bash
npm run dev:paper    # enable the reader + start dev server
npm run paper:status # is the reader currently enabled?
npm run paper:off    # disable again (do this before a public build)
```

## Position Paper Reader (Not Public)

`/position-paper` is the **public landing page** describing the forthcoming
paper. Separately, `/position-paper/read` is a **full-text reader** for the
paper itself, which must stay off the public site until publication.

**This repository is public and GitHub Pages builds from a fresh checkout, so
"hidden" is enforced with `.gitignore` — anything ignored can reach neither the
repo nor the deployed site.** Two things are ignored:

| Ignored path                        | Why                                                                                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/position-paper/read/`   | Generated route stubs. SvelteKit only routes `+`-prefixed files, so without them the route does not exist and nothing imports the reader code. |
| `src/lib/content/position-paper.md` | The real draft. Only `position-paper.example.md` is committed.                                                                                 |

Everything else is committed normally: the reader lives in `src/lib/reader/`
and `src/lib/components/reader/`, and is simply unreferenced (so Rollup never
bundles it) until `npm run paper:on` generates the stubs.

**Rules when touching the reader:**

- Never commit `src/lib/content/position-paper.md`. Put the real text there; it
  stays local. Update `position-paper.example.md` only for structural changes.
- Never import `src/lib/reader/reader.css` from `app.css`. It is imported by
  `PositionPaperReader.svelte` so its rules and its remaining reader-only
  webfont (Atkinson Hyperlegible) load only with the reader. Source Serif 4 is
  now a site-wide font, imported by `app.css`.
- Never link to `/position-paper/read` from navigation or the sitemap.
- To publish the paper later: commit the route stubs and the markdown, remove
  both `.gitignore` entries, drop the `noindex` in `PositionPaperReader.svelte`,
  and add the route to `src/routes/sitemap.xml/+server.ts`.

## Technology Stack

- **Framework:** SvelteKit with Svelte 5 (runes syntax mandatory)
- **UI:** Flowbite Svelte
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet (dynamically imported)
- **Graph:** D3 force layout (dynamically imported)
- **Fonts:** Self-hosted via @fontsource-variable (no Google Fonts requests) —
  Outfit (display), Plus Jakarta Sans (UI), Source Serif 4 (reading voice)
- **Deployment:** GitHub Pages (static adapter)

## Svelte 5 Runes (Required)

Always use runes syntax:

```svelte
<script lang="ts">
  let count = $state(0); // reactive state
  let doubled = $derived(count * 2); // computed values
  let { title } = $props(); // component props
  $effect(() => {
    /* side effects */
  });
</script>
```

Do NOT use legacy syntax (`export let`, `$:` reactive statements).

## Path Helpers (Critical for GitHub Pages)

All internal links and assets must use path helpers from `$lib/utils/paths`:

```typescript
import { resolveAppPath, resolveAssetPath } from '$lib/utils/paths';

const href = resolveAppPath('/schedule'); // For routes
const src = resolveAssetPath('/images/logo.png'); // For static assets
```

This handles the `/dh-ai-african-studies-2026` base path in production.

## Architecture

### Data Layer (`src/lib/data/`)

- `workshop-info.ts` - Dates, venue, organizers, funder (single source of truth)
- `schedule.ts` - Three-day workshop schedule + session-type styling metadata
- `participants/` - Individual `.ts` files auto-imported via `import.meta.glob`
- `references.json` - Fetched from Zotero API
- `thematic-groups.ts` (canonical group-name union), `work-streams.ts` - Conference structure
- `interviews.ts` - Participant video interviews
- `photos.ts` - Photo categories + media credit

### Adding Participants

Create `src/lib/data/participants/firstname-lastname.ts`:

```typescript
import type { Participant } from '$lib/types/participant';

export const firstnameLastname: Participant = {
  name: 'Firstname Lastname',
  affiliation: 'University Name',
  affiliationCoordinates: { latitude: 0.0, longitude: 0.0 },
  country: 'Country',
  role: 'Participant', // | 'Co-organizer' | 'Student assistant'
  bio: 'Biography...',
  researchRegions: ['West Africa']
};
```

No manual registration needed - files are auto-imported.

### SEO Pattern

Every page uses the shared `SeoHead` component:

```svelte
<script lang="ts">
  import SeoHead from '$lib/components/SeoHead.svelte';
  import { createSeoMeta, createWebPageJsonLd } from '$lib/utils/seo';

  const seo = createSeoMeta({ title: 'Page', description: '...', path: '/route' });
  const webPageJsonLd = createWebPageJsonLd({
    name: seo.title,
    description: seo.description,
    url: seo.canonical
  });
</script>

<SeoHead {seo} jsonLd={webPageJsonLd} />
```

Only home, about, and schedule additionally pass `createWorkshopEventJsonLd({ description, url })` — Event structured data on ancillary pages reads as spam to search engines. The sitemap is generated at build time by `src/routes/sitemap.xml/+server.ts`; add new routes there.

### Key Components (`src/lib/components/`)

- `Header.svelte`, `Footer.svelte` - Global layout
- `SeoHead.svelte`, `PageHero.svelte` - Shared page head + hero (use on every page)
- `AppButton.svelte` - Primary/secondary CTA button (`variant` prop)
- `UrlTabs.svelte` - URL-synced tab navigation
- `ParticipantsMap.svelte` - Leaflet interactive map
- `ConceptGraph.svelte` (+ `concept-graph/`) - D3 force-directed concept map
- `PhotoViewer.svelte` - Photo grid + lightbox
- `LiteYouTube.svelte` - Click-to-load YouTube facade (never embed iframes eagerly)
- `ReferenceFacets.svelte`, `ReferenceCard.svelte`, `Pagination.svelte`, `SearchFilter.svelte`, `ExportReferences.svelte` - Bibliography UI

## Design Philosophy: Future Forward

The site uses a **"Future Forward"** aesthetic - sophisticated and tech-forward without cultural clichés. This emphasizes the digital/AI focus of the conference while maintaining academic professionalism.

### Core Principles

1. **Teal (secondary) as dominant accent** over terra cotta (primary)
   - Teal represents digital/future themes
   - Terra cotta reserved for CTAs and warmth accents
   - `.text-gradient-teal` is reserved for the **homepage h1 only** — nine
     gradient page titles turn a signature into wallpaper. `.link-secondary`
     for links.

2. **One ambient field, page-level** — not one per section
   - The dot mesh is a single fixed pseudo-element on `.app-shell` in
     `+layout.svelte`, masked to fade out by 65% of the viewport.
     `.app-shell--no-mesh` turns it off (used on `/concepts`).
   - `.bg-radial-glow` is for the homepage hero only.

3. **Rhythm comes from bands, not from floating slabs**
   - `.band` / `.band-tight` for vertical rhythm, `.band-sunken` for a
     recessed band, `.band-ink` for a dark band, `.band-bleed` for full width.
   - One sunken band and one ink band per long page — no more.
   - `.surface-panel` is solid (no `backdrop-filter`). Glass survives only in
     `.surface-glass`: the sticky header and the lightbox chrome.

4. **Orchestrated entrance animations** with staggered timing
   - Hero: title (50ms) → subtitle (150ms) → CTAs (250ms+)
   - Sections: Use `use:reveal` action with `.animate-section-reveal`
   - Children: `.stagger-children` staggers the first six only; anything past
     that joins the tail, so large grids don't all land at once.

5. **Section headers: eyebrow + heading + left rule**
   - Use the `.section-head` pattern (`.section-head__eyebrow` + a heading);
     the rule is drawn by a pseudo-element. Centred `.accent-underline` is no
     longer the default.

6. **Cap the measure on running text**
   - `--measure-prose` (68ch) via `.prose-serif` / `.prose-measure`, and
     `--measure-lede` (46ch) via `.text-lead`. Wide containers are for grids;
     text inside them still needs a column.

7. **Static cards by default**
   - `.card-surface` does not lift. Use `.card-surface--link` only when the
     card really is a link or a button — hover feedback on a non-target is a
     false affordance.

### Page Structure Pattern

```svelte
<script lang="ts">
  import { reveal } from '$lib/utils/reveal';
  // ... other imports
</script>

<!-- Hero/Header Section — every page uses the shared PageHero component -->
<PageHero eyebrow="Section" title="Page Title" lede="One-sentence description." />

<!-- Content Sections: a band, not a floating panel -->
<section class="band padding-inline-section">
  <div class="content-width-wide animate-section-reveal" use:reveal>
    <div class="section-head">
      <p class="section-head__eyebrow">01 — Context</p>
      <h2 class="heading-section">Title</h2>
    </div>
    <p class="prose-serif">Running text, capped at 68ch.</p>
  </div>
</section>
```

### Animation Guidelines

- **Subtle & Professional**: 300-500ms transitions
- **Scroll reveals**: Trigger once the element enters the bottom ~88% of the viewport (rootMargin-based — never use a fixed intersection ratio: it is unreachable for elements taller than the viewport and leaves them invisible)
- **Respect `prefers-reduced-motion`**: The `reveal` action handles this automatically
- **Stagger delays**: 50ms between children
- **Don't wrap very tall grids in a single `use:reveal`** — apply it per card instead

## Custom CSS Classes

Use these defined in `src/app.css` instead of arbitrary Tailwind:

### Surfaces

- `.surface-panel` (solid), `.card-surface` / `.card-surface--link`,
  `.surface-glass` (sticky header + lightbox only), `.section-plain`
- `--surface-1` / `--surface-2` / `--surface-3` / `--surface-ink`

### Bands (vertical rhythm)

- `.band`, `.band-tight` — section padding from `--section-gap*`
- `.band-sunken`, `.band-ink`, `.band-bleed`

### Typography

- `.heading-display`, `.heading-section`, `.heading-sub`
- `.section-head` + `.section-head__eyebrow` — the standard section header
- `.prose-serif`, `.prose-serif-sm`, `.text-lead` — the Source Serif 4 voice
- `.prose-measure` (68ch), `.lede-measure` (46ch)
- `.text-gradient-teal` — homepage h1 only

### Backgrounds

- `.app-shell::before` — the single page-level dot mesh
- `.bg-radial-glow` — homepage hero only
- `.gradient-hero-future` — teal-dominant hero gradient

### Accessibility

- `.tap-target` — 44px minimum hit area for text-only controls
- Focus is a real `outline` in teal (`--focus-ring`), never a `box-shadow`

### Animations

- `.animate-section-reveal` + `use:reveal` - Scroll-triggered fade-up
- `.stagger-children` - Auto-stagger (first six children only)
- `.animate-hero-title`, `.animate-hero-subtitle` - Hero entrance

**Theme colors:** primary (Deep Terra Cotta #e05d44), secondary (African Teal #0d9488)

## Static Site Constraints

- All routes must be prerenderable (`export const prerender = true;`)
- No server-side code (API routes, form actions with POST)
- External links to full URLs work normally
