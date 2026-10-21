# Vento Systems

The Vento company website: intelligent products and systems for business and the physical world. Static HTML, CSS and a small progressive-enhancement script; no build step or framework dependency.

## Preview

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. A server is needed because site links and assets use root-relative paths.

## Structure

- `index.html`: company mission, interdisciplinary engineering, businesses, selected work and enquiry flow.
- `business/`, `private-ai/`, `safety/`, `autonomy/`: four business-area pages.
- `lab/`: research and early work. `cyber/`: the sister-company relationship.
- `vision/`: company thesis and development model.
- `assets/company.css`, `assets/company.js`: shared presentation and interaction.
- `assets/*.svg`: original conceptual diagrams and brand assets. `social-preview.png` is the social card exported from its SVG source.
- `docs/positioning-research.md`: reference companies, research sources and implementation decisions.
- `document-chaser/` and `sarath/`: existing independent sub-sites, retained. Document Chaser is linked as a prototype with fictional data.

Headers and footers are static HTML repeated across the eight company pages. Keep them aligned when editing. Shared layout and behavior belong in the company CSS/JS.

## Behavior

The mobile menu supports keyboard activation, Escape to close and selection of a navigation link. Project details use native HTML disclosure controls. Reduced-motion visitors retain every interaction without animated scrolling or scaling.

The enquiry form validates required fields, prepares a visible email draft and offers an email-app link and copy action. It does not send mail or retain submissions. `/?need=business#contact` preselects a business area; supported values are `general`, `business`, `private-ai`, `safety`, `autonomy`, `lab` and `cyber`. Unrecognized values use the general enquiry.

## Checks

```sh
python3 scripts/check_site.py .
node --check assets/company.js
```

The source checker validates document structure, accessible labels, local links, fragments and assets across the eight company pages. Browser checks cover desktop and 390px mobile layouts, the menu, project disclosures, enquiry preselection, draft generation and draft invalidation.

## Hosting

The repository uses GitHub Pages with the existing `CNAME`. Production is served from `main`. This new design is developed on `codex/vento-company`; pushing that branch does not replace the production site.
