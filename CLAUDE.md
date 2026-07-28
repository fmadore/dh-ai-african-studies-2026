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
  `PositionPaperReader.svelte` so its rules and its two webfonts (~229 kB:
  Source Serif 4, Atkinson Hyperlegible) load only with the reader.
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
- **Fonts:** Self-hosted via @fontsource-variable (no Google Fonts requests)
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
   - Use `.text-gradient-teal` for headings, `.link-secondary` for links

2. **Grid/mesh backgrounds** instead of blurry blobs
   - `.bg-grid-mesh` - Subtle dot grid pattern
   - `.bg-radial-glow` - Teal radial glow from top
   - `.bg-radial-glow-bottom` - Subtle terra cotta glow from bottom

3. **Orchestrated entrance animations** with staggered timing
   - Hero: title (50ms) → subtitle (150ms) → CTAs (250ms+)
   - Sections: Use `use:reveal` action with `.animate-section-reveal`
   - Children: Use `.stagger-children` class for automatic staggering

4. **Glow effects for depth**
   - `.glow-teal` - Ambient teal glow on key elements
   - `.glow-border` - Glowing border on hover
   - Card hovers use teal glow instead of primary border

5. **Teal accent underlines** on section headers
   - Use `.accent-underline` class on headings

### Page Structure Pattern

```svelte
<script lang="ts">
  import { reveal } from '$lib/utils/reveal';
  // ... other imports
</script>

<!-- Hero/Header Section — subpages use the shared PageHero component -->
<PageHero title="Page Title" lede="One-sentence description." />

<!-- Content Sections -->
<section class="bg-page padding-block-section padding-inline-section relative overflow-hidden">
  <div class="bg-grid-mesh opacity-30"></div>
  <div class="content-width-wide surface-panel surface-padding animate-section-reveal" use:reveal>
    <Heading class="heading-section accent-underline">Title</Heading>
    <!-- Content -->
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

- `.surface-panel`, `.card-surface`, `.bg-page`

### Typography

- `.heading-display`, `.heading-section`, `.heading-sub`
- `.text-gradient`, `.text-gradient-teal` (preferred)
- `.accent-underline` - Teal underline decoration

### Backgrounds (Future Forward)

- `.bg-grid-mesh` - Dot grid pattern
- `.bg-radial-glow` - Teal glow from top
- `.bg-radial-glow-bottom` - Terra cotta glow from bottom
- `.gradient-hero-future` - Teal-dominant hero gradient

### Effects

- `.glow-teal` - Teal box shadow glow
- `.glow-border` - Gradient border on hover

### Animations

- `.animate-section-reveal` + `use:reveal` - Scroll-triggered fade-up
- `.stagger-children` - Auto-stagger child animations
- `.animate-hero-title`, `.animate-hero-subtitle` - Hero entrance

**Theme colors:** primary (Deep Terra Cotta #e05d44), secondary (African Teal #0d9488)

## Static Site Constraints

- All routes must be prerenderable (`export const prerender = true;`)
- No server-side code (API routes, form actions with POST)
- External links to full URLs work normally
