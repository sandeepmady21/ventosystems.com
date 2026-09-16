# Sarath & Associates preview website

Static HTML, CSS and JavaScript, served at `https://ventosystems.com/sarath/`.
GitHub Pages publishes from this repository's `main` branch. No build step or
external runtime is required. The existing `noindex, nofollow` metadata remains
in place because this is a preview under the Ventosystems domain.

## Design and maintenance

- `assets/style.css` contains the responsive design: warm ivory, forest green,
  copper accents, Source Serif 4 headings and Source Sans 3 body text.
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
