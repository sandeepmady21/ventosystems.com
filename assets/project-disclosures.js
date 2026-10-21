/* Native details remain open without JavaScript; mobile defaults reduce page length. */
(() => {
  const disclosures = Array.from(document.querySelectorAll('[data-project-disclosure]'));
  if (!disclosures.length) return;
  const mobile = window.matchMedia('(max-width: 700px)');
  const mobileChoices = new WeakMap(disclosures.map(detail => [detail, detail.hasAttribute('data-mobile-open')]));

  const targetForHash = hash => {
    if (!hash || hash === '#') return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return null; }
  };
  const revealTarget = hash => {
    const target = targetForHash(hash);
    if (!target) return null;
    const detail = target.closest('[data-project-disclosure]') ||
      (target.matches('.project-entry, .lab-project') && target.querySelector('[data-project-disclosure]'));
    if (detail) {
      detail.open = true;
      mobileChoices.set(detail, true);
    }
    return detail ? target : null;
  };
  const applyLayout = () => {
    disclosures.forEach(detail => { detail.open = mobile.matches ? mobileChoices.get(detail) : true; });
    revealTarget(window.location.hash);
  };

  disclosures.forEach(detail => detail.addEventListener('toggle', () => {
    if (mobile.matches) mobileChoices.set(detail, detail.open);
  }));
  applyLayout();
  mobile.addEventListener('change', applyLayout);

  // Open before the browser follows a same-page link, including a repeated hash.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin === window.location.origin && url.pathname === window.location.pathname && url.search === window.location.search) revealTarget(url.hash);
  });
  window.addEventListener('hashchange', () => {
    const target = revealTarget(window.location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({block:'start'}));
  });
  // Restoring a deep link after the mobile defaults avoids a collapsed target.
  const initialTarget = revealTarget(window.location.hash);
  if (initialTarget) requestAnimationFrame(() => initialTarget.scrollIntoView({block:'start'}));
})();
