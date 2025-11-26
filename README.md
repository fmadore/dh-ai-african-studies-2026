# Digital Humanities and AI in African Studies - Workshop Website

A SvelteKit-powered static website for the **"Charting New Territory: Digital Humanities and AI in African Studies"** scoping workshop.

**🌐 Live Site:** [fmadore.github.io/dh-ai-african-studies-2026](https://fmadore.github.io/dh-ai-african-studies-2026/)

## About

This repository hosts the conference website for a three-day international workshop (18-20 February 2026) addressing the critical convergence of digital humanities and AI within African studies. The workshop is funded by the Volkswagen Foundation and brings together experts from Africa, Europe, and beyond at the Xplanatorium Herrenhausen in Hanover, Germany.

## Technology Stack

- **Framework**: [SvelteKit](https://svelte.dev/docs/kit) with [Svelte 5](https://svelte.dev/) (runes syntax)
- **UI Library**: [Flowbite Svelte](https://flowbite-svelte.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design system
- **Maps**: [Leaflet](https://leafletjs.com/) for interactive participant map
- **Citations**: [Citation.js](https://citation.js.org/) for reference formatting
- **Deployment**: GitHub Pages (static site generation)

## Features

- 📅 **Schedule** - Three-day workshop schedule with URL-synced tab navigation
- 👥 **Participants** - Searchable participant directory with thematic group views
- 🗺️ **Interactive Map** - Geographic visualization of participant affiliations
- 📚 **References** - Filterable bibliography with faceted search
- 🌓 **Dark Mode** - System-aware theme toggle
- 📱 **Responsive** - Mobile-first design
- ♿ **Accessible** - WCAG 2.1 Level AA compliance
- 🔍 **SEO Optimized** - Structured data (JSON-LD) and meta tags

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

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
└── fetch_references.py # Zotero API data fetcher
static/
├── images/             # Static images
├── robots.txt          # SEO robots file
└── sitemap.xml         # SEO sitemap
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

Run the Python script to fetch references from Zotero:

```sh
python scripts/fetch_references.py
```

## Contributing

This is a conference website project. For questions or contributions, please contact the workshop organizers.

## License

Copyright © 2025 - Workshop funded by the Volkswagen Foundation
