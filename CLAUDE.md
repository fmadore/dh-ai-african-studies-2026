# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static conference website for "Charting New Territory: Digital Humanities and AI in African Studies" (18-20 February 2026, Hanover, Germany). Funded by Volkswagen Foundation.

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
python scripts/fetch_references.py
```

Requires `ZOTERO_API_KEY` in `.env` file.

## Technology Stack

- **Framework:** SvelteKit with Svelte 5 (runes syntax mandatory)
- **UI:** Flowbite Svelte
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet
- **Citations:** Citation.js
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

- `workshop-info.ts` - Dates, venue, organizers (single source of truth)
- `schedule.ts` - Three-day workshop schedule
- `participants/` - Individual `.ts` files auto-imported via `import.meta.glob`
- `references.json` - Fetched from Zotero API
- `thematic-groups.ts`, `work-streams.ts` - Conference structure

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

Every page should use:

```svelte
<script lang="ts">
  import { createSeoMeta, createEventJsonLd, serializeJsonLd } from '$lib/utils/seo';

  const seo = createSeoMeta({ title: 'Page', description: '...', path: '/route' });
</script>

<svelte:head>
  <title>{seo.title}</title>
  {#each seo.meta as attributes, i (attributes.name ?? attributes.property ?? `meta-${i}`)}
    <meta {...attributes} />
  {/each}
</svelte:head>
```

### Key Components (`src/lib/components/`)

- `Header.svelte`, `Footer.svelte` - Global layout
- `UrlTabs.svelte` - URL-synced tab navigation
- `ParticipantsMap.svelte` - Leaflet interactive map
- `ReferenceFacets.svelte`, `SearchFilter.svelte` - Bibliography filtering

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

<!-- Hero/Header Section -->
<section class="gradient-hero-future relative overflow-hidden">
  <div class="bg-grid-mesh"></div>
  <div class="bg-radial-glow"></div>
  <!-- Content -->
</section>

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
- **Scroll reveals**: Trigger at 15% visibility, 20px translate, 300ms duration
- **Respect `prefers-reduced-motion`**: The `reveal` action handles this automatically
- **Stagger delays**: 50ms between children

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
