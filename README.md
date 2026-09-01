# Digital Humanities and AI in African Studies - Workshop Website

A SvelteKit-powered static website for the **"Charting New Territory: Digital Humanities and AI in African Studies"** scoping workshop.

**🌐 Live Site:** [fmadore.github.io/dh-ai-african-studies-2026](https://fmadore.github.io/dh-ai-african-studies-2026/)

## About

This repository hosts the conference website for a three-day international workshop (18-20 February 2026) that addressed the critical convergence of digital humanities and AI within African studies. The workshop was funded by the Volkswagen Foundation and brought together experts from Africa, Europe, and beyond at the Xplanatorium Herrenhausen in Hanover, Germany. The site now documents the workshop's outcomes: photos, participant interviews, a concept map, and the forthcoming position paper.

## The position paper

The workshop's principal output is a collectively written position paper:

> **For Whom and For What Purpose? A Position Paper on Digital Humanities and AI
> in African Studies**

|              |                                                                                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authors**  | 25 — Frédérick Madore and Vincent Hiribarren (the conveners) first, then all other participants alphabetically. The order reflects the collaborative writing process and implies no hierarchy of contribution. |
| **Venue**    | _ZMO Programmatic Texts_ (ISSN 2191-3242), Leibniz-Zentrum Moderner Orient                                                                                                                                     |
| **Expected** | September 2026                                                                                                                                                                                                 |
| **Licence**  | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — the series' terms, not the site licence                                                                                                      |
| **Status**   | Forthcoming. No DOI or PDF yet.                                                                                                                                                                                |

It synthesises the workshop into recommendations for researchers, funders, and
institutions working at the intersection of digital humanities, AI, and African
studies, centring African perspectives on infrastructure gaps, linguistic
diversity, equity, methodology, and ethics.

All of its bibliographic metadata — authors, abstract, keywords, venue, licence,
publication date — lives in one place,
[`src/lib/data/position-paper-meta.ts`](src/lib/data/position-paper-meta.ts),
which drives the landing page, the Google Scholar and Dublin Core meta tags, the
JSON-LD, and the "How to cite" widget. Change it there and nowhere else.

Two routes are involved, and only one of them is public:

| Route                  | Status                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `/position-paper`      | **Public.** Landing page describing the forthcoming paper.                           |
| `/position-paper/read` | **Not public.** Full-text reader, withheld until the paper is published — see below. |

## Technology Stack

- **Framework**: [SvelteKit](https://svelte.dev/docs/kit) with [Svelte 5](https://svelte.dev/) (runes syntax)
- **UI Library**: [Flowbite Svelte](https://flowbite-svelte.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with custom design system
- **Maps**: [Leaflet](https://leafletjs.com/) for interactive participant map, with
  [MapLibre GL](https://maplibre.org/) drawing [OpenFreeMap](https://openfreemap.org/)
  vector basemaps (no API key, no request limit)
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
- ♿ **Accessible** - WCAG 2.1 Level AA target, enforced on key routes with axe and Playwright
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

### Tests and production checks

```sh
npm run test:unit      # reference, path, SEO, and citation utilities
npm run build
npm run test:bundle    # gzip size budgets for generated CSS and JavaScript
npm run test:links     # generated internal links and fragments
npm run test:e2e       # desktop/mobile, light/dark, keyboard, and axe checks
```

Install the Chromium test runtime once with `npm run test:e2e:install`. Pull requests run the
browser suite, dependency review, and the existing format/lint/type/build workflow in GitHub
Actions. A scheduled CodeQL workflow covers JavaScript and TypeScript.

The durable visual rules and machine-readable design tokens live in [`DESIGN.md`](DESIGN.md) and
`.impeccable/design.json`. New UI should preserve that system and extend semantic tokens rather
than introduce route-specific palettes.

### Position paper reader

Working on the full-text reader at `/position-paper/read` (see
[The position paper](#the-position-paper) above for what it is).

"Not public" is enforced with `.gitignore`, not with a config flag: this
repository is public and GitHub Pages builds from a fresh checkout, so anything
ignored can reach neither the repo nor the deployed site. Two paths are ignored —
the generated route stubs (`src/routes/position-paper/read/`) and the real draft
(`src/lib/content/position-paper.md`). Without the `+`-prefixed stubs SvelteKit
has no such route, so nothing imports the reader code and Rollup never bundles
it. Only `position-paper.example.md` is committed.

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
├── optimize_images.mjs       # Resizes/compresses participant + photo images
└── make_og_image.mjs         # Builds the 1200x630 social card (npm run og:image)
static/
├── images/
│   ├── og-image.jpg    # Social card — og:image for every page, and the
│   │                   # repo's GitHub social preview (uploaded by hand)
│   └── ...             # Run npm run optimize:images after adding photos
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

## Citation

Citation metadata lives in [`CITATION.cff`](CITATION.cff); GitHub renders it as a
"Cite this repository" button in the sidebar.

## License

This repository mixes software with workshop materials, and the two carry
different terms. The content terms are declared in
[`src/lib/data/site-meta.ts`](src/lib/data/site-meta.ts) and rendered in the site
footer; this table mirrors them and should be kept in step with that file.

| What                                                                  | Terms                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Source code — `src/`, `scripts/`, build configuration                 | [MIT](LICENSE)                                                                                         |
| Site text and compiled data — page copy, bios, schedule, bibliography | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)                                        |
| Photographs and video interviews                                      | © [Calum Houston](https://calumbrett.myportfolio.com/). Reuse requires the photographer's permission.  |
| The position paper                                                    | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), per the ZMO Programmatic Texts series |

The position paper's licence is deliberately **not** the site licence: the series
terms permit commercial reuse and require share-alike, which CC BY-NC does
neither. The two are kept in separate constants so they cannot drift into each
other.

Copyright © 2026 Frédérick Madore. The workshop was funded by the Volkswagen
Foundation.
