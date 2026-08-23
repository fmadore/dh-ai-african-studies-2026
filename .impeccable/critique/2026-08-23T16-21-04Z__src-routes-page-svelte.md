---
target: src/routes/+page.svelte (homepage)
total_score: 21
max_score: 40
na_heuristics:
p0_count: 1
p1_count: 3
timestamp: 2026-08-23T16-21-04Z
slug: src-routes-page-svelte
---

Method: dual-agent (A: design review · B: detector/browser evidence), synthesized by the orchestrator with independent verification of the theme-toggle finding in a compositing browser.

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                                                                                                                        |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1         | Visibility of System Status     | 2         | Archive state never shown; "Read the position paper" gives no hint the paper is forthcoming; fact grid counts "1 position paper" as a completed output                                           |
| 2         | Match System / Real World       | 2         | Primary CTA promises a document that does not exist; "Outcomes" means different sets in nav vs page; 01/02/03 eyebrows promise three parts on a five-band page                                   |
| 3         | User Control and Freedom        | 3         | Nothing traps; Escape closes the nav submenu and restores focus. Docked for the theme-toggle color stranding                                                                                     |
| 4         | Consistency and Standards       | 1         | `.heading-sm` is a dead class (= `.heading-sub`); two card-title scales (29.8px vs 20px) for one role; outcome titles are `<span>` not `<h3>`; page re-implements `.band-bleed` inline           |
| 5         | Error Prevention                | 2         | Two outcome tiles have no image fallback; shared `{:else}` renders the document motif for every media type; one thumbnail hotlinks i.ytimg.com                                                   |
| 6         | Recognition Rather Than Recall  | 3         | Destinations plainly named with descriptions and artwork; docked because "Outcomes" must be reconciled across nav and page                                                                       |
| 7         | Flexibility and Efficiency      | 2         | No body route to the bibliography; hero spends 40px reprinting the date instead of offering a route; one-hop access only via the header dropdown                                                 |
| 8         | Aesthetic and Minimalist Design | 2         | Visual craft high (band rhythm, one glass surface, one ink band); content minimalism fails: "position paper" ×5, "work streams" ×4 before the outcomes; goal cards duplicate downstream sections |
| 9         | Error Recovery                  | 1         | All existing failure modes (image load failure, empty photo set) produce silent blanks or the wrong motif                                                                                        |
| 10        | Help and Documentation          | 3         | Footer "Cite this site" copy block is excellent; docked because it lives only in chrome                                                                                                          |
| **Total** |                                 | **21/40** | **Acceptable**                                                                                                                                                                                   |

All ten heuristics scored; applicable maximum 40.

## Design Specificity Verdict

The voice is authored for this product; the skeleton is not. Real authored evidence: editorial eyebrows ("01 — Why we met"), bespoke inline-SVG outcome motifs, the full-bleed photo strip, the hairline-ruled hero fact grid, and prose no template could supply. But the composition is the 2026 conference-landing default — gradient hero → stats → dual CTA → three card grids — and it is still shaped like a pre-event announcement retrofitted into past tense. PRODUCT.md says outcome pages are primary and "nothing on the site persuades toward a future action — it records"; yet the page's peak affordance (the only terracotta CTA) points at the one artefact that does not exist, and the outcomes band starts 67% down a 3,925px page. Of ten body links, /photos takes three and /position-paper two, while /references, /participants, and /schedule get zero.

Deterministic scan (B): 16 CLI findings on the built homepage — 11 cramped-padding (10 disproved by computed styles; the detector does not resolve var()/clamp()), 3 low-contrast (all cross-theme token pairings, disproved in both real themes), 1 all-caps-body (the hero eyebrow — a label role, misclassified), 1 dark-glow (real: --shadow-accent). Browser overlay reported 59 elements, dominated by ai-color-palette (54, mostly SVG children inheriting the brand teal — the project's own sanctioned accent) and 3 text-overflow findings disproved as artifacts of a non-compositing pane. Where A and the detector agree: the dark glow. Where A caught what the detector cannot: the dead heading class, the IA inversion, the hotlinked thumbnail, the missing outcome headings, and the theme-toggle stranding.

Detector irony worth recording: the static engine's "false positive" (#5eead4 on #fbfaf9, 1.4:1) is literally reachable at runtime — toggling the theme strands transitioned link colors in exactly that state.

## Priority Issues

**[P0] The page's loudest affordance promises a document that does not exist.** The only terracotta CTA reads "Read the position paper" and lands on "Coming soon / Forthcoming — in preparation" (src/routes/+page.svelte:147 → position-paper/+page.svelte:48,136). The hero fact grid counts "1 — POSITION PAPER" as a completed output. Three truth-states for one artefact on one page. Fix: point the primary CTA at something that exists (concept map or bibliography), demote the paper to secondary with honest copy, replace the "1 position paper" fact with a real holding (reference count or interview count).

**[P1] The archive files its holdings last and omits three of them.** Outcomes begin at 2,634px of 3,925px; /references, /participants, /schedule get zero body links; sections 01 and 02 restate each other (goal cards duplicate the work-streams band). Fix: promote Outcomes toward the top, expand to five tiles including References (matching the nav's own definition), collapse duplicate goal cards, link the 26/16 hero stats to /participants.

**[P1] Theme toggle strands every transitioned color — VERIFIED in a compositing browser.** After toggling dark→light, .link-secondary and header .nav-link remain rgb(94,234,212) (~1.4:1 on the light page) indefinitely; the element's own --text-link resolves #0f766e correctly while its 0.15s color transition never completes (stuck animations present 3.9s after the flip). Fix: a one-frame `html.theme-switching * { transition: none !important }` guard in the toggle, or drop `color` from theme-affected transition lists.

**[P1] `.heading-sm` is a dead class; two card-title scales for one role.** utilities.css:430 sets .heading-sm to --text-2xl, identical to .heading-sub; "heading-sub heading-sm" renders 29.76px, same as the hero subtitle, while WorkStreamCards uses text-lg (20px) for the same role. Fix: give .heading-sm a real value (--text-xl) or delete it and standardise card titles.

**[P2] Outcome tiles lack typed fallbacks and one hotlinks Google.** Photos/Interviews tiles are `<img loading="lazy">` with no onerror; the interviews thumbnail is https://i.ytimg.com/... — the homepage's only third-party request, on a site that self-hosts fonts explicitly to avoid such requests. The shared {:else} branch shows a document motif for every media type. Fix: self-host the poster via the optimize:images pipeline, add typed fallback motifs.

## Persona Red Flags

**Alex (power user, arrives from a citation):** "bibliography" appears nowhere on the homepage; /references is the fourth item in a click-to-open dropdown labelled Outcomes whose page-level namesake omits it. The fastest button on the page costs him a page load to reach "Coming soon."

**Sam (screen reader + keyboard):** the four outcome destinations are absent from the heading outline (titles are `<span>`, not `<h3>` — heading navigation stops exactly where the archive begins); no section carries aria-label so there are no region landmarks on a 3,925px page; the h1 uses background-clip:text with no `@media (forced-colors: active)` fallback anywhere in src/; his likely first action (theme switch) triggers the stranding bug. Credit: skip link, real 3px focus outline, Escape handling, roving tabindex on the graph are genuinely good.

**Casey (distracted mobile):** both hero CTAs are below the fold even at 1280×720; the hero is ~3 phone screens on mobile (368-char lede vs the 46ch lede spec); the photo strip — her best reason to stay — is 2,394px down.

## Minor Observations

- .photo-strip re-implements .band-bleed inline; both share the 100vw scrollbar overhang (~7.6px each side, hidden by the .app-shell clip — DESIGN.md's own Don't).
- .stagger-children > * clobbers .card-surface--link's hover transition (lift creeps over 360ms; border/shadow snap).
- Eyebrow numbering 01/02/03 on a five-band page; the unnumbered photo strip interrupts 02→03.
- Header .nav-link measures 39px, footer links 34px against the documented 44px text-control floor (hamburger and theme toggle correctly hit 44).
- .text-lead resolves --text-muted, so the hero's key sentence is dimmer than the body prose below it.
- .animate-pulse-glow runs an infinite 6s loop (reduced-motion aware, but no pause control).
- .band-ink does not remap --focus-ring (passes at 5.4:1, but inconsistent with the documented dark-environment focus tone).
- The page-level dot mesh described by CLAUDE.md and DESIGN.md does not exist in code — lost in commit b5b7704 during the app.css split, the same commit that documented it.

## Questions to Consider

1. If the hero were deleted and the page opened on the photo strip followed by the outcome grid, what would actually be lost? The hero's 817px contribute a title and a button to a document that does not exist.
2. The concept map is the most technically ambitious thing this project built; why is it represented by a 160×90 static sketch of itself, 2,900px down, instead of leading?
3. Is this homepage the pre-event page with the verbs changed? If rebuilt as an archive index — holdings first, narrative second — would anything about the design system change, or only the order of the bands?
