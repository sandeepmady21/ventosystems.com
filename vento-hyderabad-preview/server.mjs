import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const port = Number(process.argv[2] ?? 8774);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('Choose a port between 1024 and 65535.');
}

const pages = new Map([
  ['/', ['Home', './index.html']],
  ['/engagement-models/', ['Engagement models', './engagement-models/index.html']],
  ['/how-we-work/', ['How we work', './how-we-work/index.html']],
  ['/capabilities/', ['Capabilities', './capabilities/index.html']],
  ['/hyderabad/', ['Hyderabad', './hyderabad/index.html']],
  ['/contact/', ['Contact', './contact/index.html']],
]);

const files = new Map([
  ['/preview.css', ['text/css; charset=utf-8', './preview.css']],
  ['/preview.js', ['text/javascript; charset=utf-8', './preview.js']],
  ['/assets/company.css', ['text/css; charset=utf-8', '../assets/company.css']],
  ['/assets/favicon.svg', ['image/svg+xml', '../assets/favicon.svg']],
  ['/assets/hyderabad-hitec-city.jpg', ['image/jpeg', './assets/hyderabad-hitec-city.jpg']],
  ['/assets/delivery/engineering-studios-640.webp', ['image/webp', '../assets/delivery/engineering-studios-640.webp']],
  ['/assets/delivery/engineering-studios-1280.webp', ['image/webp', '../assets/delivery/engineering-studios-1280.webp']],
]);

const models = [
  ['team-extension', 'Team extension'],
  ['dedicated-teams', 'Dedicated engineering teams'],
  ['offshore-development-center', 'Offshore Development Center'],
  ['global-capability-center', 'Global Capability Center'],
  ['build-operate-transfer', 'Build–Operate–Transfer'],
];

function header(path) {
  const nav = ['/how-we-work/', '/capabilities/', '/hyderabad/'].map(route =>
    `<a href="${route}"${path === route ? ' aria-current="page"' : ''}>${pages.get(route)[0]}</a>`
  ).join('');
  const modelLinks = models.map(([anchor, label]) =>
    `<a href="/engagement-models/#${anchor}">${label}</a>`
  ).join('');

  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="preview-header"><div class="shell nav-shell">
  <a class="brand" href="/" aria-label="Vento Systems, home"><img src="/assets/favicon.svg" width="42" height="42" alt=""><span>VENTO<span class="brand-small">SYSTEMS</span></span></a>
  <button class="preview-menu" type="button" aria-controls="preview-nav" aria-expanded="false" hidden>Menu <span aria-hidden="true">+</span></button>
  <nav id="preview-nav" class="preview-nav" aria-label="Main navigation">
    <details class="solutions"><summary${path === '/engagement-models/' ? ' class="current"' : ''}>Solutions <span aria-hidden="true">⌄</span></summary>
      <div class="solutions-menu"><a href="/engagement-models/"${path === '/engagement-models/' ? ' aria-current="page"' : ''}>Compare all models</a>${modelLinks}</div>
    </details>
    ${nav}
    <a class="button nav-contact" href="/contact/"${path === '/contact/' ? ' aria-current="page"' : ''}>Get in touch <span aria-hidden="true">↗</span></a>
  </nav>
</div></header>`;
}

const footer = `
<footer class="preview-footer"><div class="shell">
  <div class="footer-content">
    <div><a class="footer-brand" href="/" aria-label="Vento Systems, home">VENTO</a><p>Offshore engineering &amp; GCCs<br>Hyderabad, Telangana, India</p></div>
    <nav aria-label="Footer navigation">
      <a href="/engagement-models/">Engagement models</a><a href="/how-we-work/">How we work</a>
      <a href="/capabilities/">Capabilities</a><a href="/hyderabad/">Hyderabad</a><a href="/contact/">Contact</a>
    </nav>
    <div><a href="mailto:hello@ventosystems.com">hello@ventosystems.com</a><a href="https://ventosystems.com/">Vento Systems corporate site <span aria-hidden="true">↗</span></a></div>
  </div>
  <p class="footer-legal">© 2026 Vento Systems Pvt Ltd</p>
</div></footer>
<script src="/preview.js" defer></script>`;

const server = createServer(async (request, response) => {
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  try {
    const path = new URL(request.url, 'http://127.0.0.1').pathname;
    const normalized = path.endsWith('/') ? path : `${path}/`;
    if (pages.has(normalized) && normalized !== path) {
      const query = new URL(request.url, 'http://127.0.0.1').search;
      response.writeHead(308, { Location: normalized + query });
      response.end();
      return;
    }

    const page = pages.get(path);
    const asset = files.get(path);
    if (!page && !asset) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Page not found.');
      return;
    }

    const contents = page
      ? (await readFile(new URL(page[1], import.meta.url), 'utf8'))
          .replace('<!-- SITE_HEADER -->', () => header(path))
          .replace('<!-- SITE_FOOTER -->', () => footer)
      : await readFile(new URL(asset[1], import.meta.url));

    response.writeHead(200, { 'Content-Type': page ? 'text/html; charset=utf-8' : asset[0] });
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    console.error(error.message);
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('The preview could not load this page.');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Vento Hyderabad preview: http://127.0.0.1:${port}/`));
