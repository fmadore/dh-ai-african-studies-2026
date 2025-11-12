# Digital Humanities and AI in African Studies - Workshop Website

A SvelteKit-powered static website for the "Charting New Territory: Digital Humanities and AI in African Studies" scoping workshop.

## About

This repository hosts the conference website for a three-day international workshop addressing the critical convergence of digital humanities and AI within African studies. The workshop is funded by the Volkswagen Foundation and brings together experts from Africa, Europe, and beyond.

## Technology Stack

- **Framework**: SvelteKit with Svelte 5 (runes syntax)
- **UI Library**: Flowbite Svelte
- **Styling**: Tailwind CSS v4
- **Deployment**: GitHub Pages (static site generation)

## Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

The site will be available at `http://localhost:5173`

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

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch.

### GitHub Pages Setup

1. Go to repository Settings → Pages
2. Under "Build and deployment", select:
   - **Source**: GitHub Actions
3. The workflow in `.github/workflows/deploy.yml` will handle the rest

The site will be available at: `https://fmadore.github.io/dh-ai-african-studies-2026/`

### Manual Deployment

You can also trigger a deployment manually:
1. Go to the Actions tab in the GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable Svelte components
│   ├── data/           # Participant and workshop data
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── routes/
│   ├── about/          # About page
│   ├── participants/   # Participants page
│   ├── position-paper/ # Position paper page
│   ├── schedule/       # Schedule page
│   └── +page.svelte    # Homepage
└── app.css             # Global styles
static/
├── images/             # Static images
├── robots.txt          # Search engine instructions
└── sitemap.xml         # Site map
```

## Contributing

This is a conference website project. For questions or contributions, please contact the workshop organizers.

## License

Copyright © 2025 - Workshop funded by the Volkswagen Foundation
