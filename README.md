# Digital Humanities and AI in African Studies - Workshop Website

A SvelteKit-powered static website for the **"Charting New Territory: Digital Humanities and AI in African Studies"** scoping workshop.

**🌐 Live Site:** [fmadore.github.io/dh-ai-african-studies-2026](https://fmadore.github.io/dh-ai-african-studies-2026/)

## About

This repository hosts the conference website for a three-day international workshop (18-20 February 2026) that addressed the critical convergence of digital humanities and AI within African studies. The workshop was funded by the Volkswagen Foundation and brought together experts from Africa, Europe, and beyond at the Xplanatorium Herrenhausen in Hanover, Germany. The site now documents the workshop's outcomes: photos, participant interviews, a concept map, and the published position paper.

## The position paper

The workshop's principal output is a collectively written position paper:

> **For Whom and For What Purpose? A Position Paper on Digital Humanities and AI
> in African Studies**

|               |                                                                                                                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authors**   | 25 — Frédérick Madore and Vincent Hiribarren (the conveners) first, then all other participants alphabetically. The order reflects the collaborative writing process and implies no hierarchy of contribution. |
| **Venue**     | _ZMO Programmatic Texts_ (ISSN 2191-3242), Leibniz-Zentrum Moderner Orient                                                                                                                                     |
| **Published** | 9 September 2026                                                                                                                                                                                               |
| **Licence**   | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — the series' terms, not the site licence                                                                                                      |
| **Status**    | Published. DOI: 10.58144/20260827-000. Full text and EPUB available; corrected PDF pending.                                                                                                                    |

It synthesises the workshop into recommendations for researchers, funders, and
institutions working at the intersection of digital humanities, AI, and African
studies, centring African perspectives on infrastructure gaps, linguistic
diversity, equity, methodology, and ethics.

All of its bibliographic metadata — authors, abstract, keywords, venue, licence,
publication date — lives in one place,
[`src/lib/data/position-paper-meta.ts`](src/lib/data/position-paper-meta.ts),
which drives the landing page, the Google Scholar and Dublin Core meta tags, the
JSON-LD, and the "How to cite" widget. Change it there and nowhere else.

Both publication routes are public:

| Route                  | Status                                                             |
| ---------------------- | ------------------------------------------------------------------ |
| `/position-paper`      | **Public.** Publication details, citation, abstract and downloads. |
| `/position-paper/read` | **Public.** Complete article, linked references, notes and photo.  |

## Export the position paper as EPUB

Run `npm run export:epub` to create `static/documents/position-paper.epub`
from the local final Markdown, using the reader's parser and publication metadata.
Python 3 is required (standard library only); set `EPUB_PYTHON` to its executable
path if it is not available as `python` on Windows or `python3` elsewhere.
The export includes the Day 3 photo, project links, references, and numbered notes.
The packager checks XML, internal link targets, and ZIP integrity. Exports use stable
metadata and ZIP timestamps; `npm run check:epub` compares normalized archive contents
without modifying the file. CI additionally runs checksum-pinned EPUBCheck 5.4.0.

`npm run build:paper` regenerates the EPUB before building the reader. For direct
`npm run build` usage, rerun `npm run export:epub` after changing the paper first.
The reader shows **Download EPUB** when the generated file exists at build time.
The final Markdown, reader routes and generated EPUB are included in the repository.
The PDF's page range is retained as publication metadata; EPUB pagination reflows
with each device's screen and font settings.

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

- [Node.js](https://nodejs.org/) (v24; `.nvmrc` and `engines` use the tested Node 24 line)
- npm
- Python 3.10+ (data transformations, EPUB export, and their tests; standard library only)

SvelteKit 3 configuration lives in `vite.config.ts`, including static prerendering
and the GitHub Pages `BASE_PATH`. Vitest reuses that configuration. Existing `$lib`
imports are retained through an explicit compatibility alias; new subpath-import
conventions can be adopted independently. TypeScript remains on version 6 to match
the framework and linter peer requirements.

### Install dependencies

```sh
npm ci
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
npm run test:unit      # reader, graph viewport, photos, reference and SEO utilities
npm run test:python    # offline reference-fetching and graph extraction fixtures
npm run test:scripts   # image pipeline: idempotence, metadata and atomic writes
npm run check:epub     # verify the downloadable edition matches current sources
BASE_PATH=/dh-ai-african-studies-2026 npm run build
npm run test:static    # core archive content is present before hydration
npm run test:bundle    # global and per-route static-import budgets
BASE_PATH=/dh-ai-african-studies-2026 npm run test:links
BASE_PATH=/dh-ai-african-studies-2026 npm run test:e2e
```

Install Chromium and WebKit once with `npm run test:e2e:install`. On Windows, set
`BASE_PATH` in the shell environment before running the commands instead of the inline
POSIX assignment shown above. The production validation workflow runs formatting, lint,
types, offline transformations, EPUB freshness/conformance, static content, link/bundle
checks and browser journeys before uploading the exact tested build for deployment.
WebKit covers reader/navigation journeys; Chromium covers desktop and mobile, themes,
keyboard interactions and axe. Dependency review and scheduled CodeQL (JavaScript,
TypeScript and Python) remain independent security checks.

The durable visual rules and machine-readable design tokens live in [`DESIGN.md`](DESIGN.md) and
`.impeccable/design.json`. New UI should preserve that system and extend semantic tokens rather
than introduce route-specific palettes.

### Position paper reader

The published full text lives in `src/lib/content/position-paper.md` and loads at
`/position-paper/read` in every build. Edit it, run `npm run export:epub` to update
the downloadable edition, then `npm run build` (or use `npm run build:paper`).
The manuscript and EPUB are versioned along with the website.

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

The site deploys to GitHub Pages after a push to `main` passes the production validation
job. Pull requests run the same validation without deploying. No artifact is published
until its unit, transformation, EPUB, static-content, bundle, link and browser checks pass.

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
├── fetch_references.py       # Zotero API data fetcher (needs ZOTERO_API_KEY)
├── python.mjs                # Runs a Python script with python3 / python / $PYTHON
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

Copy `.env.example` to `.env`, fill in `ZOTERO_API_KEY` (or set it in the environment), then:

```sh
npm run fetch:references
```

This runs `python3` (`python` on Windows); set `PYTHON` to use another interpreter.

### Optimizing Images

After adding images to `static/images/participants/` or `static/images/photos/`:

```sh
npm run optimize:images
```

Portraits are converted to 640px WebP; gallery photos are resized to 1920px JPEG
with 640px WebP thumbnails. Capture dates and attribution are retained; unrelated
camera metadata is removed from new derivatives. The committed optimization manifest
records source/settings/output hashes, so unchanged images are not recompressed.
Existing optimized assets were adopted without changing their bytes. New originals
are kept under ignored `assets/image-originals/`, outside public `static/`; back these
up separately and commit the manifest with generated derivatives. A fresh clone can
skip unchanged derivatives without the originals, but rebuilding needs the source.
Output and manifest writes are transactional. Use `--offline` to skip poster downloads;
`--adopt-existing` is a migration-only option already applied to the 94 legacy assets.

The graph download at `/concepts/data.json` includes extraction provenance. The
current snapshot was corrected from the existing published graph by removing four
nonseed nodes that lacked two distinct seed neighbours; its provenance identifies
that transformation rather than claiming a new extraction from private notes.
Future exports use `scripts/extract_concept_graph.py` with explicit input paths,
distinct-neighbour selection, canonical sorted edges and an input snapshot digest.

The programme and directory are rendered completely before JavaScript; tabs progressively
enhance those sections after hydration. The concept map includes a searchable text
directory, and map/graph failures retain access to the underlying archive.

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
