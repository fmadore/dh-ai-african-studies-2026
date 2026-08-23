# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: African-studies and digital-humanities researchers consulting the
workshop's outcomes — the concept map, video interviews, position paper,
photos, and bibliography. Secondary: workshop participants revisiting the
record of an event they attended, and funders and institutions (Volkswagen
Foundation among them) evaluating what the workshop produced.

## Product Purpose

The permanent public record of "Charting New Territory: Digital Humanities
and AI in African Studies," a Volkswagen Foundation–funded workshop held
18–20 February 2026 in Hanover, Germany. The workshop has taken place; the
site is a post-event archive, not an announcement. Success means the site
stays citable, credible, and readable for years without maintenance.

## Positioning

The authoritative primary source for this workshop. Outcome pages (concept
map, interviews, position paper, photos) are the primary content; schedule
and participant pages document who was there and what happened. Nothing on
the site persuades toward a future action — it records.

## Operating Context

Visitors arrive from academic citations, search, and participants sharing
the record. The site is read on desktop and mobile, in light and dark
themes. All copy is written in past tense. Bibliography data is synced from
a Zotero library; images pass through an optimization script before
shipping.

## Capabilities and Constraints

- Static prerendered SvelteKit site deployed to GitHub Pages under the
  `/dh-ai-african-studies-2026` base path. No server code, no POST actions;
  every route must remain prerenderable. Internal links and assets must go
  through the `resolveAppPath` / `resolveAssetPath` helpers.
- Svelte 5 runes syntax only (`$state`, `$derived`, `$props`, `$effect`).
- The position-paper full-text reader (`/position-paper/read`) is
  unpublished until the paper appears: its route stubs and the real
  manuscript are gitignored, and only the public `/position-paper` landing
  page is in scope for design work.
- Heavy libraries (Leaflet map, D3 concept graph) are dynamically imported;
  YouTube embeds load via a click-to-load facade, never eagerly.

## Brand Commitments

- The "Future Forward" visual system recorded in DESIGN.md and CLAUDE.md is
  the incumbent world: teal as the dominant interaction accent, terra cotta
  as the rarer institutional signature. Its invariants in CLAUDE.md are
  binding.
- Fonts are self-hosted via @fontsource-variable; the site makes no
  Google Fonts requests.
- Volkswagen Foundation funding is acknowledged; the workshop name, dates,
  and venue are fixed facts.

## Evidence on Hand

Real content throughout: participant profiles with affiliations and
coordinates (`src/lib/data/participants/`), the three-day schedule,
a Zotero-synced bibliography (`src/lib/data/references.json`), workshop
photographs (`static/images/`), video interviews, concept-map data, and the
position-paper landing copy. No testimonials, metrics, or claims exist
beyond these; none may be invented.

## Product Principles

- Archive first: preserve and present what happened; never invent content,
  claims, or future-tense framing.
- Citability: stable URLs, structured data, and sitemap discipline outrank
  novelty.
- Reading over spectacle: comprehension, measure caps, and scanability win
  over decoration on every content page.
- Longevity: static, dependency-light, and prerenderable — the site must
  keep working untouched for years.

## Accessibility & Inclusion

Public-record standard for an academic audience: full keyboard
operability, visible teal focus outlines (real `outline`, never
`box-shadow`), `prefers-reduced-motion` respected by every animation, and
text contrast verified in both light and dark themes.
