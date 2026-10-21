/* Progressive enhancements shared by the company pages. */
(() => {
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const setMenu = open => {
    if (!menu || !nav) return;
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  if (menu && nav) {
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
    });
    document.addEventListener('click', e => { if (!e.target.closest('.site-header')) setMenu(false); });
    const wide = window.matchMedia('(min-width: 901px)');
    wide.addEventListener('change', () => { if (wide.matches) setMenu(false); });
  }
  const form = document.getElementById('enquiry-form');
  if (!form) return;
  const area = document.getElementById('enquiry-area');
  const topic = document.getElementById('enquiry-topic');
  const engagement = document.getElementById('enquiry-path');
  const nameField = document.getElementById('enquiry-name');
  const companyField = document.getElementById('enquiry-company');
  const messageField = document.getElementById('enquiry-message');
  const preview = document.getElementById('enquiry-preview');
  const draft = document.getElementById('enquiry-draft');
  const status = document.getElementById('form-status');
  const open = document.getElementById('enquiry-open');
  const topicAreas = new Map([
    ['travio', 'business'],
    ['ap-automation', 'business'],
    ['auditproof', 'business'],
    ['practice-tracker', 'business'],
    ['distribution', 'business'],
    ['perception-control', 'autonomy']
  ]);
  const engagementPaths = new Set(['general', 'product', 'engineering', 'research']);
  const hasOption = (select, value) => Boolean(select && Array.from(select.options).some(option => option.value === value));
  const setOption = (select, value) => {
    if (!hasOption(select, value)) return false;
    select.value = value;
    return true;
  };
  const label = select => select?.selectedOptions[0]?.text || '';
  const oneLine = value => value.replace(/[\r\n]+/g, ' ').trim();
  const syncTopicArea = () => {
    const expected = topicAreas.get(topic?.value);
    if (expected) setOption(area, expected);
  };

  // Only known values from the visible controls can influence an enquiry.
  // A specific product supplies its area when links contain conflicting context.
  const query = new URLSearchParams(location.search);
  setOption(area, query.get('need'));
  const requestedTopic = query.get('topic');
  if ((requestedTopic === 'general' || topicAreas.has(requestedTopic)) && setOption(topic, requestedTopic)) syncTopicArea();
  const requestedPath = query.get('path');
  if (engagementPaths.has(requestedPath)) setOption(engagement, requestedPath);

  const invalidateDraft = () => {
    if (preview.hidden) return;
    preview.hidden = true;
    draft.value = '';
    open.href = 'mailto:hello@ventosystems.com';
    status.textContent = 'Your details changed. Prepare the enquiry again to update your draft.';
  };
  const handleEdit = event => {
    if (event.target === topic) syncTopicArea();
    if (event.target === area && topicAreas.has(topic?.value) && topicAreas.get(topic.value) !== area.value) setOption(topic, 'general');
    if (event.target === nameField || event.target === messageField) event.target.setCustomValidity('');
    invalidateDraft();
  };
  form.addEventListener('input', handleEdit);
  form.addEventListener('change', handleEdit);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = nameField.value.trim();
    const company = oneLine(companyField.value);
    const message = messageField.value.trim();
    nameField.setCustomValidity(name ? '' : 'Please enter your name.');
    messageField.setCustomValidity(message ? '' : 'Please add a few words about your enquiry.');
    if (!form.reportValidity()) return;

    const interest = topic && topic.value !== 'general' ? label(topic) : label(area);
    const pathLabel = engagement && engagement.value !== 'general' ? label(engagement) : '';
    const subject = [interest, pathLabel, company].filter(Boolean).map(oneLine).join(' — ');
    const context = [
      `Area: ${label(area)}`,
      ...(topic ? [`Interest: ${label(topic)}`] : []),
      ...(pathLabel ? [`Engagement: ${pathLabel}`] : []),
      `Name: ${oneLine(name)}`,
      ...(company ? [`Organization: ${company}`] : [])
    ];
    const body = `Hello Vento,\n\n${message}\n\n${context.join('\n')}\n`;
    draft.value = `To: hello@ventosystems.com\nSubject: ${subject}\n\n${body}`;
    open.href = `mailto:hello@ventosystems.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    preview.hidden = false;
    status.textContent = 'Your draft is ready. Open your email app or copy it below. Nothing has been sent.';
    draft.focus();
  });
  document.getElementById('enquiry-copy').addEventListener('click', async () => {
    if (preview.hidden) return;
    try { await navigator.clipboard.writeText(draft.value); status.textContent = 'Draft copied. Paste it into your email app to send it.'; }
    catch { draft.focus(); draft.select(); status.textContent = 'Select and copy the draft below, then paste it into your email app.'; }
  });
})();
