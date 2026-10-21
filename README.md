# ventosystems.com

The Vento Systems website. Plain HTML and one stylesheet, no framework, no build step.

- `index.html` is the home page: the headline, the five division tiles, Why Vento, clients and the
  contact form (the form opens the visitor's email app; there is no server).
- `automation/`, `ai/`, `robotics/`, `safety/`, `cyber/` each hold one `index.html`, the page a
  division tile opens. The header and footer are repeated in each file; change all six together.
- `assets/site.css` styles every page. Colours are set once at the top.
- `CNAME` is the custom domain for GitHub Pages.
- `404.html` sends unknown paths back to the homepage.
- `.nojekyll` tells GitHub Pages to serve the files as they are.
- `sarath/` and `document-chaser/` are separate pages that the main site does not link to.

To link a division page to the contact form with that division already chosen, use
`/?need=automation#contact` (or `ai`, `robotics`, `safety`, `cyber`).

Deploys automatically from the `main` branch via GitHub Pages.
