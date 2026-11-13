# Vento Systems website

The website for Vento Systems, published at ventosystems.com: plain HTML, CSS and one small script, with no build step and no framework.

## Preview locally

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/`. A local server is needed because links and assets use root-relative paths.

## Layout

- `index.html` and one folder per page (`about/`, `india/`, `cyber/` and so on), each with an `index.html`.
- `preview.css` and `preview.js`: the shared styles and script for every page.
- `assets/`: images, product screens, clips and icons.
- `scripts/check_site.py`: checks pages, links, anchors and assets. Run `python3 scripts/check_site.py .` before publishing.

Pushing to `main` publishes the site through GitHub Pages.
