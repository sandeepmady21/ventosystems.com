# Sarath & Associates preview website

Static HTML, CSS and JavaScript, served at `https://ventosystems.com/sarath/`.
GitHub Pages publishes from this repository's `main` branch. No build step or
external runtime is required. The existing `noindex, nofollow` metadata remains
in place because this is a preview under the Ventosystems domain.

## Design and maintenance

- `assets/style.css` contains the responsive design: warm ivory, rich teal,
  terracotta, cobalt and gold, Source Serif 4 headings and Source Sans 3 body text.
  Practice colours match between the homepage and service details. Mastheads use
  page-specific colour, while forms and long reading surfaces remain light.
- All fonts, images and scripts are local. There are no trackers or third-party
  requests during page load.
- Headers and footers are repeated in the 11 HTML files; update them together.
- `assets/site.js` enables mobile navigation, active navigation links and
  keyboard scrolling of newsletter tables. Navigation remains available with
  JavaScript disabled. Motion respects `prefers-reduced-motion`.
- `assets/careers.js` prepares an email using the applicant's email app. It does
  not send or store application data. Keep its field IDs and `data-label`
  attributes in sync with `careers.html`.
- Keep partner qualifications/membership numbers, office details, service
  anchors and newsletter content factual. Existing TODO comments identify
  details still awaiting confirmation by the firm.

## Architectural image

`assets/architecture.jpg` is an original image generated with the built-in image
generation tool for the September 2026 redesign. It is an illustrative
architectural study, not a photograph of the firm's premises. The original
image was exported as an optimised JPEG for this site.

Generation prompt: Architectural editorial photograph for a premium Indian
chartered accountancy firm's website; portrait 4:5. A sculptural, imaginary
contemporary Indian institutional courtyard with repeating pale sandstone piers,
a deep recessed archway, a reflecting pool and restrained olive-green planting.
Warm limestone, dark forest-green shadows, subtle pale sky and late-afternoon
sunlight. Close architectural perspective, repeating fins on the left and a
sweeping arch through the upper right. Calm, tactile, realistic architectural
magazine photography with subtle grain. No people, writing, logos, watermark,
flags or office signage; no website mockup.

## Preview and verify

From the repository root, run `python3 -m http.server 4173 --bind 127.0.0.1` and
open `http://127.0.0.1:4173/sarath/`. Check all pages at mobile and desktop sizes,
the mobile menu with keyboard and Escape, local links and article anchors,
newsletter tables, and careers form validation before pushing changes.

## Browser and sharing identity

- `assets/favicon.svg` is an outlined Source Serif 4 “S” on the site's teal.
  It has no font, script or external resource dependencies. `favicon.ico`
  contains 16, 32 and 48 px versions; `favicon-32.png` is a PNG fallback.
  `apple-touch-icon.png` is a 180 px home-screen icon.
- `assets/social-preview-v1.jpg` is the 1200 × 630 sharing card. It uses the
  existing architectural image and locally served site fonts, with exact
  typeset wording. It is not a new photograph of the firm's premises.
- All 11 page heads include Open Graph and large-image Twitter Card metadata,
  their own title, description and absolute URL, and the shared preview image.
  The homepage's canonical URL is `https://ventosystems.com/sarath/`.
  Keep `noindex, nofollow` while this remains a client preview.
- `branding/social-card.html` is the editable, fixed-size card layout.
  `branding/build.cjs` regenerates the card and icons using Playwright 1.62.1,
  fontkit 2.0.4 and sharp 0.35.3, with locally installed Chrome. Make those
  development packages available to Node, then run
  `node sarath/branding/build.cjs` from the repository root. None are needed
  by GitHub Pages or website visitors.
- If the shared design changes, use a new versioned JPEG filename and update
  every page's `og:image` and `twitter:image` URL. Social platforms can cache
  previews; verify the public asset and page metadata after publishing.
- When moving to the firm's own domain, update the canonical, `og:url` and
  absolute social image URLs together. Do not change the parent Ventosystems
  site's icon or branding.
