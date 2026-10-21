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
- `work/travio/` and `work/perception-control/`: engineering notes and explanatory workflow diagrams, using the existing public project scope.
- `assets/company.css`, `assets/company.js`: shared presentation and interaction.
- `assets/home-v2.css`, `assets/case-studies.css`: homepage and engineering-note layouts.
- `assets/*.svg`: original conceptual diagrams and brand assets. `social-preview.png` is the social card exported from its SVG source.
- `document-chaser/` and `sarath/`: existing independent sub-sites, retained. Document Chaser is linked as a prototype with fictional data.

Headers and footers are static HTML repeated across the eight company pages. Keep them aligned when editing. Shared layout and behavior belong in the company CSS/JS.

## Behavior

The mobile menu supports keyboard activation, Escape to close and selection of a navigation link. Project details use native HTML disclosure controls. Reduced-motion visitors retain every interaction without animated scrolling or scaling.

The enquiry form validates required fields, prepares a visible email draft and offers an email-app link and copy action. It does not send mail or retain submissions. `/?need=business#contact` preselects a field; supported values are `general`, `business`, `private-ai`, `safety`, `autonomy`, `lab` and `cyber`.

`topic` preserves a specific interest: `travio`, `ap-automation`, `auditproof`, `practice-tracker`, `distribution`, or `perception-control`. A valid topic selects its matching field. `path` selects `product`, `engineering` or `research`. Unknown values are ignored. Changing the field resets an incompatible topic, and editing any details invalidates an older draft. The form stays explicitly email-based until a delivery provider is configured.

## Checks

```sh
python3 scripts/check_site.py .
node --check assets/company.js
node --test scripts/test_enquiry.mjs
```

The source checker validates document structure, accessible labels, local links, fragments and assets across ten company pages. Enquiry tests cover routing, encoded drafts, invalid inputs, edit invalidation and clipboard fallback. Browser checks cover desktop and mobile layouts, navigation, enquiry selections and draft behavior.

## Hosting

The repository uses GitHub Pages with the existing `CNAME`. Production is served from `main`; feature branches do not publish until merged. `sitemap.xml` lists company pages; the independent Document Chaser prototype retains its own noindex directive.

## Saved version

The annotated tag **`vento-company-v1`** preserves the exact site deployed on 21 October 2026 before the second company-site pass, including the label and contrast fixes. It points to `2fe73d4545ec5b5f304d0481f17b99442ef6a42a` and is pushed to GitHub. Keep the tag unchanged.

To restore that version, create a restoration branch from current `main`, restore the tracked tree from the tag, and merge the restoration through a pull request. This preserves subsequent history and allows GitHub Pages to publish the restored tree. The earlier pre-redesign version is also retained on `backup/main-before-company-2026-10-21`.
