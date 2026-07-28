# Digital Humanities and AI in African Studies - Workshop Website

A SvelteKit-powered static website for the **"Charting New Territory: Digital Humanities and AI in African Studies"** scoping workshop.

**🌐 Live Site:** [fmadore.github.io/dh-ai-african-studies-2026](https://fmadore.github.io/dh-ai-african-studies-2026/)

## About

This repository hosts the conference website for a three-day international workshop (18-20 February 2026) that addressed the critical convergence of digital humanities and AI within African studies. The workshop was funded by the Volkswagen Foundation and brought together experts from Africa, Europe, and beyond at the Xplanatorium Herrenhausen in Hanover, Germany. The site now documents the workshop's outcomes: photos, participant interviews, a concept map, and the forthcoming position paper.

## Technology Stack

- **Framework**: [SvelteKit](https://svelte.dev/docs/kit) with [Svelte 5](https://svelte.dev/) (runes syntax)
- **UI Library**: [Flowbite Svelte](https://flowbite-svelte.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design system
- **Maps**: [Leaflet](https://leafletjs.com/) for interactive participant map
- **Graph**: [D3](https://d3js.org/) force layout for the concept map
- **Deployment**: GitHub Pages (static site generation)

## Features

- 📅 **Schedule** - Three-day workshop schedule with URL-synced tab navigation
- 👥 **Participants** - Searchable participant directory with thematic group views
- 🗺️ **Interactive Map** - Geographic visualization of participant affiliations
- 🕸️ **Concept Map** - Interactive network of themes from the bibliography
- 📸 **Photos & Interviews** - Workshop gallery and participant video interviews
- 📚 **References** - Filterable bibliography with faceted search and BibTeX/RIS export
- 🌓 **Dark Mode** - System-aware theme toggle
- 📱 **Responsive** - Mobile-first design
- ♿ **Accessible** - WCAG 2.1 Level AA compliance
- 🔍 **SEO Optimized** - Structured data (JSON-LD) and meta tags

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.19 or later; `.nvmrc` pins v24)
- npm
- Python 3.10+ (only for the data scripts; both are stdlib-only)

### Install dependencies

```sh
npm install
```

### Start the development server

```sh
npm run dev
```

The site will be available at `http://localhost:5173`

### Type checking

```sh
npm run check
```

### Linting

```sh
npm run lint
```

### Position paper reader

The workshop's position paper has a full-text reader at `/position-paper/read`.
It is **deliberately excluded from the public site** until the paper is
published: the route stubs and the draft markdown are gitignored, so neither
this repository nor the GitHub Pages build ever contains them. (`/position-paper`
itself — the page describing the forthcoming paper — is public and unaffected.)

Enable it locally:

```sh
npm run dev:paper
```

Then edit `src/lib/content/position-paper.md`, which stays out of git. Run
`npm run paper:off` to remove the route again. See `CLAUDE.md` for the full
contract, including how to publish the reader when the time comes.

## Building

Create a production build:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

### Manual Deployment

1. Go to the Actions tab in the GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

```
src/
├── lib/
│   ├── assets/         # Static assets (favicon, etc.)
│   ├── components/     # Reusable Svelte components
│   │   ├── Footer.svelte
│   │   ├── Header.svelte
│   │   ├── ParticipantsMap.svelte
│   │   ├── ReferenceFacets.svelte
│   │   ├── SearchFilter.svelte
│   │   ├── UrlTabs.svelte
│   │   └── ...
│   ├── data/           # Centralized data
│   │   ├── participants/   # Individual participant files (auto-imported)
│   │   ├── references.json # Zotero-fetched bibliography
│   │   ├── schedule.ts
│   │   ├── thematic-groups.ts
│   │   ├── work-streams.ts
│   │   └── workshop-info.ts
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions (paths, seo)
├── routes/
│   ├── +layout.svelte  # Global layout
│   ├── +page.svelte    # Homepage
│   ├── about/          # About page
│   ├── participants/   # Participants directory
│   ├── position-paper/ # Position paper page
│   ├── references/     # Bibliography page
│   └── schedule/       # Workshop schedule
└── app.css             # Global styles & design system
scripts/
├── fetch_references.py       # Zotero API data fetcher (needs ZOTERO_API_KEY in .env)
├── extract_concept_graph.py  # Builds concept-graph.json from Obsidian notes
└── optimize_images.mjs       # Resizes/compresses participant + photo images
static/
├── images/             # Static images (run npm run optimize:images after adding)
└── robots.txt          # SEO robots file (sitemap.xml is generated at build time)
```

## Adding Content

### Adding a New Participant

1. Create a new file in `src/lib/data/participants/` (e.g., `jane-doe.ts`)
2. Export a participant object using the `Participant` type:

```typescript
import type { Participant } from '$lib/types/participant';

export const janeDoe: Participant = {
  name: 'Jane Doe',
  affiliation: 'University Name',
  affiliationCoordinates: { latitude: 0.0, longitude: 0.0 },
  country: 'Country',
  role: 'Participant',
  bio: 'Biography text...',
  researchRegions: ['Region 1', 'Region 2']
};
```

The participant is automatically imported via `import.meta.glob`.

### Updating References

Copy `.env.example` to `.env`, fill in `ZOTERO_API_KEY`, then:

```sh
npm run fetch:references
```

### Optimizing Images

After adding images to `static/images/participants/` or `static/images/photos/`:

```sh
npm run optimize:images
```

Portraits are converted to 640px WebP; gallery photos are resized to 1920px
JPEG (EXIF preserved — the photos page uses capture dates to group by day)
with 640px WebP thumbnails.

## Contributing

This is a conference website project. For questions or contributions, please contact the workshop organizers.

## License

Copyright © 2026 - Workshop funded by the Volkswagen Foundation
