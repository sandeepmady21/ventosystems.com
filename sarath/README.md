# Sarath & Associates preview website

Static HTML, CSS and JavaScript, served at `https://ventosystems.com/sarath/`.
GitHub Pages publishes from this repository's `main` branch. No build step or
external runtime is required. The existing `noindex, nofollow` metadata remains
in place because this is a preview under the Ventosystems domain.

## Design and maintenance

- The responsive design pairs the supplied CA logo's clear blue `#195888` with
  small emerald `#239C64` and apricot `#EFA36C` accents on warm ivory `#F8F7F3`
  and white. The editorial opening pairs a blue serif headline with the
  architectural image. Fine rules replace heavy rainbow cards and colored slabs.
  The original CA logo image is unchanged.
  `assets/style.css` holds the global design system, navigation and footer;
  `assets/home.css` holds the homepage; `assets/pages.css` holds interior pages.
  Source Serif 4 leads headings; Source Sans 3 provides readable body copy and
  navigation. The offices section provides one blue anchor within the light page.
- The founding-year section uses the user-supplied photograph in
  `assets/leaf-canopy.webp`, not a green background or illustrated tree.
  It is decorative, with an empty alt attribute, and is lazy-loaded. The founding
  year and registration remain live HTML on a 90%-opaque navy caption panel.
  The earlier `assets/heritage-tree.webp` illustration is preserved but not displayed.
  The earlier `assets/architectural-lines.svg` is preserved but no longer used.
- Links and buttons do not use decorative arrow marks. Text links use a quiet
  underline; cards retain clear hover and keyboard-focus states. The arrows in
  the archived April article's GST menu sequence are content, not decoration.
- Use white or warm-cream text on blue and dark navy text on mint and apricot.
  Emerald and apricot accent colors are decorative or surface fills, not small text
  on white. Darker green and copper variants keep text and control borders readable.
- All fonts, images and scripts are local. There are no trackers or third-party
  requests during page load.
- Headers and footers are repeated in the 11 HTML files; update them together.
- `assets/site.js` enables mobile navigation, active navigation links and
  keyboard scrolling of newsletter tables. Navigation remains available with
  JavaScript disabled. Motion respects `prefers-reduced-motion`.
- Careers has a direct `mailto:` Apply button, not a form or submission backend.
  Visitors review and send applications in their own email app. The current
  recipient is `info@sarathcas.in`, pending a dedicated careers alias.
- The six practice areas and partner assignments follow the October 2026
  client feedback. People includes the nine supplied qualified professionals;
  membership numbers are intentionally not displayed. Updated partner bios
  are still awaiting client copy, so the existing biographies are preserved.
- Keep partner qualifications, office details, service
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

## Founding-year canopy photograph

`assets/leaf-canopy.webp` is the photograph supplied by the user on 7 October 2026:
sunlight through a leafy canopy, viewed from below. The original 4000 × 6000 PNG
was optimized to a 1200 × 1800 WebP without retouching. The photograph is used as
atmospheric imagery, not identified as the firm's premises. Text is kept within
a bounded `#142F43` caption at 90% opacity; even over pure white, white caption
text has approximately 10:1 contrast. The original supplied file is left unchanged.

## Earlier tree illustration (not displayed)

`assets/heritage-tree.webp` is an original decorative illustration generated with
the built-in image-generation tool (not the fallback CLI) on 7 October 2026.
The generated transparent PNG was optimized to a 1200 × 800 WebP with its alpha
preserved. It is a symbolic botanical illustration, not a tree at the firm's premises.

Final generation prompt:

> Use case: stylized-concept. Asset type: botanical editorial illustration for the founding-year section of a professional Indian chartered accountancy website. Primary request: one beautiful mature tree with lots of leaves, replacing a plain green background beside the year 1990. Subject: a single spreading Indian rain tree with an elegant branching trunk and a lush, finely detailed broad canopy of many individual leaves. Style: refined botanical watercolor and delicate engraved ink linework, sophisticated natural history folio illustration, subtly textured but crisp at web size, not cartoon clip art. Composition: the complete tree centered, from crown to trunk base, no clipped branches, generous small transparent margins, broad canopy, airy visible gaps among leaf clusters. Colors: fresh natural emerald and deep green leaves with subtly sunlit lighter green highlights; warm dark brown trunk. Backdrop: genuinely transparent alpha, no landscape or sky or opaque paper rectangle. Constraints: no words, numbers, labels, logos, watermark, frame, people, birds, money symbols or extra objects. The image will sit above the live HTML number 1990 on warm ivory.

## Preview and verify

From the repository root, run `python3 -m http.server 4173 --bind 127.0.0.1` and
open `http://127.0.0.1:4173/sarath/`. Check all pages at mobile and desktop sizes,
the mobile menu with keyboard and Escape, local links and article anchors,
newsletter tables and PDF downloads, and the careers email link before pushing changes.

## Newsletter downloads

- `downloads/newsletter-2026-03.pdf` and `downloads/newsletter-2026-04.pdf` are
  downloadable editions of the existing archived newsletters. Archive and
  issue pages link to them directly, with no service or backend required.
- `branding/build-newsletters.cjs` copies the existing article, table and
  disclaimer markup into a print layout using `branding/newsletter-pdf.css`.
  With Playwright available to Node and Chrome installed, run
  `node sarath/branding/build-newsletters.cjs` from the repository root.
- After changing an issue, regenerate its PDF, compare extracted text with
  the original, and render every page to verify pagination and table layout.
  These PDFs preserve historical issue content; they are not current guidance.

## Browser and sharing identity

- `assets/favicon.svg` is an outlined logo-blue Source Serif 4 “S” on ivory,
  with emerald and apricot accents.
  It has no font, script or external resource dependencies. `favicon.ico`
  contains 16, 32 and 48 px versions; `favicon-32.png` is a PNG fallback.
  `apple-touch-icon.png` is a 180 px home-screen icon.
- `assets/social-preview-v9.jpg` is the 1200 × 630 sharing card. It uses the
  light editorial palette, existing architectural image and locally served site
  fonts, with exact typeset wording. It is not a new photograph of the firm's
  premises.
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
