/*
 * Produce faithful, downloadable PDF editions from the existing issue pages.
 * Run with Playwright available (for example NODE_PATH=<runtime>/node_modules).
 * The source article, table and disclaimer markup is copied without rewriting.
 */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outputs = path.join(root, 'downloads');
const qaDirectory = process.env.NEWSLETTER_QA_DIR;

(async () => {
  fs.mkdirSync(outputs, { recursive: true });
  if (qaDirectory) fs.mkdirSync(qaDirectory, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const issue of ['2026-03', '2026-04']) {
      const page = await browser.newPage();
      await page.goto(pathToFileURL(path.join(root, `newsletter-${issue}.html`)).href);
      const source = await page.evaluate(() => {
        const hero = document.querySelector('.page-hero__inner');
        const articles = [...document.querySelectorAll('.issue__article')];
        const disclaimer = document.querySelector('.issue__disclaimer');
        return {
          title: document.querySelector('h1').textContent.trim(),
          hero: [hero.querySelector('.eyebrow'), hero.querySelector('h1'), hero.querySelector('.page-hero__lead')].map(el => el.outerHTML).join('\n'),
          contents: document.querySelector('.aside-nav ol').outerHTML,
          articles: articles.map(el => el.outerHTML).join('\n'),
          disclaimer: disclaimer.outerHTML,
          paragraphs: [...articles.flatMap(el => [...el.querySelectorAll('h2,h3,h4,p,li,caption,th,td')]), ...disclaimer.querySelectorAll('h2,p')]
            .map(el => el.textContent.replace(/\s+/g, ' ').trim()),
        };
      });
      await page.setContent(`<!doctype html><html lang="en-IN"><head>
        <meta charset="utf-8"><title>${source.title} - Sarath &amp; Associates</title>
        <base href="${pathToFileURL(__dirname + path.sep).href}">
        <link rel="stylesheet" href="newsletter-pdf.css">
        </head><body><section class="pdf-cover">
          <div class="pdf-brand">Sarath &amp; Associates<span>Chartered Accountants · Since 1990</span></div>
          ${source.hero}
          <nav class="pdf-contents"><h2>In this issue</h2>${source.contents}</nav>
        </section>${source.articles}${source.disclaimer}</body></html>`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const destination = path.join(outputs, `newsletter-${issue}.pdf`);
      await page.pdf({
        path: destination,
        format: 'A4',
        printBackground: true,
        tagged: true,
        outline: true,
        displayHeaderFooter: true,
        margin: { top: '19mm', right: '18mm', bottom: '19mm', left: '18mm' },
        headerTemplate: `<div style="width:100%;margin:0 18mm;font:8px Arial,sans-serif;color:#606d64;display:flex;justify-content:space-between"><span>SARATH &amp; ASSOCIATES</span><span>${source.title} | Newsletter</span></div>`,
        footerTemplate: '<div style="width:100%;margin:0 18mm;font:8px Arial,sans-serif;color:#606d64;display:flex;justify-content:space-between"><span>Chartered Accountants</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
      });
      if (qaDirectory) fs.writeFileSync(path.join(qaDirectory, `source-${issue}.json`), JSON.stringify(source, null, 2));
      console.log(destination);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
