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
  const query = new URLSearchParams(location.search);
  const projects = new Map([
    ['travio', { label: 'Travio', area: 'business' }],
    ['ap-automation', { label: 'AP Automation', area: 'business' }],
    ['auditproof', { label: 'AuditProof', area: 'business' }],
    ['practice-tracker', { label: 'Practice Tracker', area: 'business' }],
    ['operations', { label: 'Operations systems', area: 'business' }],
    ['mobile-robot', { label: 'Mobile robot', area: 'autonomy' }],
    ['controller', { label: 'Controller firmware', area: 'autonomy' }]
  ]);
  let project = projects.get(query.get('project'));
  // A known project determines its area, even when the URL's need disagrees.
  const requestedArea = project ? project.area : query.get('need');
  if (Array.from(area.options).some(option => option.value === requestedArea)) area.value = requestedArea;
  const preview = document.getElementById('enquiry-preview');
  const draft = document.getElementById('enquiry-draft');
  const status = document.getElementById('form-status');
  const open = document.getElementById('enquiry-open');
  const clearUnrelatedProject = () => {
    // Once the visitor changes area, do not revive an earlier project later.
    if (project && project.area !== area.value) project = undefined;
  };
  const invalidateDraft = () => {
    clearUnrelatedProject();
    if (!preview.hidden) { preview.hidden = true; status.textContent = 'Your details changed. Create the email draft again to update it.'; }
  };
  form.addEventListener('input', invalidateDraft);
  area.addEventListener('change', invalidateDraft);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = document.getElementById('enquiry-name').value.trim();
    const company = document.getElementById('enquiry-company').value.trim();
    const message = document.getElementById('enquiry-message').value.trim();
    if (!name || !message) { status.textContent = 'Please add your name and a few words about your enquiry.'; return; }
    clearUnrelatedProject();
    const subject = `${project ? project.label + ' — ' : ''}${area.selectedOptions[0].text}${company ? ' — ' + company : ''}`;
    const body = `Hello Vento,\n\n${message}\n\n${project ? 'Project: ' + project.label + '\n' : ''}Area: ${area.selectedOptions[0].text}\nName: ${name}${company ? '\nOrganization: ' + company : ''}\n`;
    draft.value = `To: hello@ventosystems.com\nSubject: ${subject}\n\n${body}`;
    open.href = `mailto:hello@ventosystems.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    preview.hidden = false;
    status.textContent = 'Your draft is ready. Open your email app or copy it below.';
    draft.focus();
  });
  document.getElementById('enquiry-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(draft.value); status.textContent = 'Draft copied. Paste it into your email app to send it.'; }
    catch { draft.focus(); draft.select(); status.textContent = 'Select and copy the draft below, then paste it into your email app.'; }
  });
})();
