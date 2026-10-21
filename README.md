# Vento Systems

The Vento company website: interdisciplinary technology across AI, software, sensing and embedded control. Static HTML, CSS and a small progressive-enhancement script; no build step or framework dependency.

## Preview

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. A server is needed because site links and assets use root-relative paths.

## Structure

- `index.html`: company mission, combined engineering and business areas, selected work and enquiry flow.
- `business/`, `private-ai/`, `safety/`, `autonomy/`: four business-area pages.
- `lab/`: research and early work. `cyber/`: cybersecurity expertise and enquiries.
- `vision/`: company thesis and development model.
- `assets/company.css`, `assets/company.js`: shared presentation and interaction.
- `assets/exploration.css`: scoped presentation additions for Vision, Lab and Cyber, using the company design tokens.
- `assets/*.svg`: original conceptual diagrams and brand assets. `social-preview.png` is the social card exported from its SVG source.
- `sitemap.xml`, `robots.txt`: discovery for the eight canonical company pages. The sitemap excludes the independent demo sub-sites; robots.txt permits crawling throughout the site.
- `document-chaser/`: an interactive prototype with fictional data and its own ledger-inspired visual style.
- `sarath/`: an 11-page client preview with its own editorial identity, local assets and `noindex, nofollow` metadata. Its README describes the supplied firm information and historical newsletters.
- `404.html`: a branded recovery page with absolute links, so missing addresses at any depth can return to Vento.

The homepage combines the shared engineering introduction with the four illustrated business cards. Both `#businesses` and the legacy `#engineering` anchor lead to this section.

Each business-area page keeps its shared visual components and uses a conceptual illustration of the system it explains. Its introduction links to the detailed work and an area-specific enquiry. Project and development labels distinguish client work, working builds, prototypes and research; proposed assessment and pilot outputs describe the scope to agree, rather than delivered results.

Vision explains the shared engineering approach through `assets/artwork-v2/vision-system.webp`. Lab pairs `lab-primer.webp` and `lab-gather.webp` with each project's scope, current stage, research question and a possible next experiment. The eight illustrations use consistent graphite, warm ivory and copper studio materials. They are conceptual illustrations, not product photographs, screenshots or commitments to a release. The homepage opens with the company proposition; the decorative V hero has been removed. Original SVGs and the orange variants remain unchanged in the repository. Four domain pages select wider compositions on desktop and complete standard compositions on smaller screens. Optimized WebP assets are published; exact built-in imagegen prompts are in `docs/illustrations/`.

Cyber uses `assets/artwork-v2/cyber-system.webp` to explain environment boundaries, access, specialist review and an agreed scope. The page explains how to discuss an environment and scope with Vento Cyber and specialist partners.

Headers and footers are static HTML repeated across the eight company pages. Keep them aligned when editing. Shared layout and behavior belong in the company CSS/JS.

## Behavior

The mobile menu supports keyboard activation, Escape to close and selection of a navigation link. Project details use native HTML disclosure controls. Reduced-motion visitors retain every interaction without animated scrolling or scaling.

The enquiry form validates required fields, prepares a visible email draft and offers an email-app link and copy action. It does not send mail or retain submissions. `/?need=business#contact` preselects a business area; supported values are `general`, `business`, `private-ai`, `safety`, `autonomy`, `lab` and `cyber`. For area-only links, unrecognized values use the general enquiry.

Project links also carry a recognized `project` ID, for example `/?need=business&project=travio#contact`. Recognized project context appears above the enquiry fields and is included in the email draft. Supported IDs map to these areas:

| Project IDs | Area |
| --- | --- |
| `travio`, `ap-automation`, `auditproof`, `practice-tracker`, `operations` | `business` |
| `mobile-robot`, `controller` | `autonomy` |
| `primer`, `gather` | `lab` |

A recognized project determines its area even if `need` specifies another area. Unknown project IDs are ignored. Choosing a different area clears the project context; changing back does not restore it. Editing the form invalidates any previously prepared draft.

## Checks

```sh
python3 scripts/check_site.py .
node --check assets/company.js
node --test scripts/test_enquiry.mjs
```

The source checker validates document structure, accessible labels, local links, fragments and assets across the eight company pages and the root fallback. Browser checks cover desktop and mobile layouts, menus, project disclosures, area and project enquiry context, draft generation and recovery navigation. The independent Sarath and Document Chaser sub-sites are outside this company-site refinement.

## Mobile experience

The homepage opens without a decorative hero image and brings the illustrated domains before the longer shared-engineering explanation. The phone layout uses shorter headline wrapping, tighter section spacing, 44px-or-larger primary touch targets, a scrollable menu, and single-column enquiry fields at 16px text size.

Business and Autonomy project rows use native disclosures with titles and current stages always visible. At phone widths, the first project starts open; desktop and no-JavaScript views show all project content. Lab keeps its artwork and current project descriptions visible while research questions and next experiments can expand on demand. Direct project links open their matching disclosure. Vision and Cyber offer full-size artwork links.

`assets/mobile.css` applies only to the company pages. `assets/project-disclosures.css` and `assets/project-disclosures.js` are loaded by Business, Autonomy and Lab. Sarath and Document Chaser do not use these assets and remain unchanged.

## Hosting

The repository uses GitHub Pages with `CNAME` set to `ventosystems.com`. Production at `https://ventosystems.com/` is served from `main`. The current improvements are developed on `codex/vento-mobile-first`; pushing this branch does not replace production. Changes reach production through a reviewed pull request merged into `main`.

## Rollback

The remote tag `vento-company-v1.9` preserves the production state immediately before the studio artwork and hero removal, at commit `85a1605`. The earlier dark illustration treatment is preserved by `vento-company-v1.8` at `668c87e`. This checkpoint includes both independent sub-sites, which remain unchanged in this refinement. The older `vento-company-v1.7`, `vento-company-v1.6`, `vento-company-v1.5`, `vento-company-v1.4`, `vento-company-v1.3`, `vento-company-v1.2`, `vento-company-v1.1` and `vento-company-v1` tags remain available as earlier checkpoints.

To restore v1.9, work from the repository root with a clean working tree and create a new branch from current production. Restore the tagged tree as a new change; do not reset or force-push `main`.

```sh
git fetch origin --tags
git switch -c restore/vento-company-v1-9 origin/main
git restore --source=vento-company-v1.9 --staged --worktree -- .
git diff --cached --stat
python3 scripts/check_site.py .
node --check assets/company.js
git commit -m "Restore Vento company v1.9"
git push -u origin restore/vento-company-v1-9
```

Review the restored site locally, then open and merge a pull request from the restore branch into `main`. After GitHub Pages publishes, verify the production site. This retains the improvements in Git history while restoring the saved site files.
