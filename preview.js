const nav = document.getElementById('preview-nav');
const menu = document.querySelector('.preview-menu');
const dropdowns = [...document.querySelectorAll('.preview-nav details')];

function closeDropdowns(except) {
  dropdowns.forEach(d => { if (d !== except) d.open = false; });
}
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  if (!open) closeDropdowns();
}

if (nav && menu) {
  menu.hidden = false;
  document.documentElement.classList.add('preview-js');
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  dropdowns.forEach(d => d.addEventListener('toggle', () => { if (d.open) closeDropdowns(d); }));
  document.addEventListener('click', event => {
    if (!event.target.closest('.preview-header')) setMenu(false);
    else if (!event.target.closest('details')) closeDropdowns();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = dropdowns.find(d => d.open);
    if (open) {
      open.open = false;
      open.querySelector('summary').focus();
    } else if (menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
}

const form = document.getElementById('brief-form');
if (form) {
  const fields = form.elements;
  const params = new URLSearchParams(location.search);
  const topics = new Map([
    ['team-extension', 'offshore'], ['dedicated-team', 'offshore'], ['offshore', 'offshore'],
    ['offshore-development', 'odc'], ['odc', 'odc'], ['gcc', 'gcc'],
    ['build-operate-transfer', 'transfer'], ['transfer', 'transfer'],
    ['business', 'business'], ['private-ai', 'private-ai'], ['safety', 'safety'],
    ['autonomy', 'autonomy'], ['lab', 'lab'], ['cyber', 'cyber'], ['general', 'general'], ['choose', 'choose'],
    ['public-sector', 'public-sector'], ['government', 'public-sector'],
  ]);
  const projects = new Map([
    ['tarivo', ['Tarivo', 'business']], ['ap-automation', ['AP Automation', 'business']], ['sightline', ['Sightline', 'business']], ['plinth', ['Plinth', 'business']], ['branchglass', ['BranchGlass', 'business']],
    ['auditproof', ['AuditProof', 'business']], ['practice-tracker', ['Practice Tracker', 'business']],
    ['operations', ['Distribution operations', 'business']], ['mobile-robot', ['Mobile robot', 'autonomy']],
    ['controller', ['Controller firmware', 'autonomy']], ['primer', ['Primer', 'lab']], ['gather', ['Gather', 'lab']],
  ]);
  const prompts = new Map([
    ['choose', 'Share the work the team would take on and what you still need to decide.'],
    ['offshore', 'Share the work, the skills you need and when you would like to start.'],
    ['odc', 'What would the center build? Share the roles, leadership and target start.'],
    ['gcc', 'What would the center own? Share the first functions and your target start.'],
    ['transfer', 'What should be set up first, and when would you like to take it over?'],
    ['business', 'Which workflow or product is this about, and what should change?'],
    ['private-ai', 'Which documents or systems should the AI work with, and where must it run?'],
    ['safety', 'Describe the site, the people involved and what should trigger a response.'],
    ['autonomy', 'Describe the machine, the environment and the problem to solve.'],
    ['lab', 'Which project or research question is this about?'],
    ['cyber', 'What should be tested or audited, where does it run, and is there a deadline?'],
    ['public-sector', 'Which agency or bid is this for, and what should the system do? A capability statement request is fine too.'],
    ['general', 'Tell us what you have in mind.'],
  ]);
  const project = projects.get(params.get('project'));
  const requested = project ? project[1] : topics.get(params.get('topic'));
  if (requested) fields.interest.value = requested;
  const context = document.getElementById('brief-context');
  if (project && context) {
    context.textContent = `About: ${project[0]}`;
    context.hidden = false;
  }
  const setPrompt = () => { fields.message.placeholder = prompts.get(fields.interest.value) ?? prompts.get('general'); };
  setPrompt();
  fields.interest.addEventListener('change', setPrompt);

  const result = document.getElementById('draft-result');
  const status = document.getElementById('draft-status');
  const draft = document.getElementById('draft');
  const copy = document.getElementById('copy-draft');

  form.addEventListener('input', () => { status.textContent = ''; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = fields.name.value.trim();
    const message = fields.message.value.trim();
    if (!name || !message) {
      status.textContent = 'Please add your name and a short note.';
      (name ? fields.message : fields.name).focus();
      return;
    }
    const topic = fields.interest.selectedOptions[0].text;
    const company = fields.company.value.trim();
    const recipient = 'hello@ventosystems.com';
    const subject = `Enquiry: ${project ? project[0] : topic}`;
    const body = `Hello Vento,\n\n${message}\n\nName: ${name}${company ? `\nOrganization: ${company}` : ''}\nTopic: ${topic}`;
    draft.value = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    result.hidden = false;
    status.textContent = 'Opening your email app with this draft. Nothing is sent until you press send there.';
    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  copy?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft.value);
      copy.textContent = 'Copied';
    } catch {
      draft.select();
    }
  });
}

// Product clips: play only while visible, never for people who prefer reduced motion, with a pause button.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('video.clip-video').forEach(video => {
  const button = video.parentElement.querySelector('.clip-toggle');
  let userPaused = reduceMotion.matches;
  const sync = () => { if (button) button.textContent = video.paused ? 'Play' : 'Pause'; };
  const tryPlay = () => { if (!userPaused) video.play().catch(() => {}); };
  if (reduceMotion.matches) video.pause();
  new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? tryPlay() : video.pause()));
  }, { threshold: 0.35 }).observe(video);
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  button?.addEventListener('click', () => {
    if (video.paused) { userPaused = false; video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  });
  sync();
});

// Clip tabs: one frame, switch between clips; arrow keys move between tabs.
document.querySelectorAll('.clip-player').forEach(player => {
  const tabs = [...player.querySelectorAll('[role="tab"]')];
  const select = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      const video = panel.querySelector('video');
      if (!on) video.pause();
      else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { video.preload = 'metadata'; video.play().catch(() => {}); }
    });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus(); select(next);
    });
  });
});

// India team builder: count the roles you need, then add the list to the enquiry form on the same page.
document.querySelectorAll('[data-builder]').forEach(builder => {
  document.documentElement.classList.add('builder-js');
  const MAX = 20;
  const rows = [...builder.querySelectorAll('.builder-row')];
  const counts = new Map(rows.map(r => [r, 0]));
  const total = builder.querySelector('[data-total]');
  const totalLabel = builder.querySelector('[data-total-label]');
  const picked = builder.querySelector('[data-picked]');
  const note = builder.querySelector('[data-note]');
  const sum = () => [...counts.values()].reduce((a, b) => a + b, 0);
  const people = n => (n === 1 ? 'person' : 'people');
  const lines = () => rows.filter(r => counts.get(r) > 0)
    .map(r => `${counts.get(r)} ${counts.get(r) === 1 ? r.dataset.name : `${r.dataset.name}s`}`);
  const render = () => {
    const n = sum();
    total.textContent = n;
    totalLabel.textContent = people(n);
    picked.textContent = n ? lines().join(' · ') : 'Add roles with the + buttons.';
    rows.forEach(r => {
      const c = counts.get(r);
      r.querySelector('output').textContent = c;
      r.classList.toggle('is-on', c > 0);
      r.querySelector('[data-step="-1"]').setAttribute('aria-disabled', String(c === 0));
      r.querySelector('[data-step="1"]').setAttribute('aria-disabled', String(c === MAX));
    });
  };
  builder.addEventListener('click', event => {
    const button = event.target.closest('[data-step]');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    const row = button.closest('.builder-row');
    counts.set(row, Math.min(MAX, Math.max(0, counts.get(row) + Number(button.dataset.step))));
    note.textContent = '';
    render();
  });
  builder.querySelector('[data-use]').addEventListener('click', () => {
    const n = sum();
    if (!n) {
      note.textContent = 'Add at least one role first.';
      rows[0].querySelector('[data-step="1"]').focus();
      return;
    }
    const form = document.getElementById('brief-form');
    if (!form) return;
    const f = form.elements;
    const block = [`Team we have in mind (${n} ${people(n)}):`, ...lines().map(l => `- ${l}`)].join('\n');
    const previous = form.dataset.teamBlock;
    const text = f.message.value;
    if (previous && text.includes(previous)) f.message.value = text.replace(previous, block);
    else f.message.value = text.trim() ? `${block}\n\n${text.trim()}` : `${block}\n\nWhat the team would own: `;
    form.dataset.teamBlock = block;
    f.message.rows = Math.max(5, Math.min(14, f.message.value.split('\n').length + 1));
    if (f.interest.value === 'choose') {
      f.interest.value = 'offshore';
      f.interest.dispatchEvent(new Event('change'));
    }
    note.textContent = 'Added to your enquiry below.';
    document.getElementById('plan')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    f.message.focus({ preventScroll: true });
    f.message.setSelectionRange(f.message.value.length, f.message.value.length);
  });
  render();
});

// Section bar: mark the section in view, and keep its link visible when the bar scrolls sideways.
document.querySelectorAll('.section-bar').forEach(bar => {
  const list = bar.querySelector('ul');
  const links = [...bar.querySelectorAll('ul a')];
  const sections = links.map(a => document.querySelector(a.hash)).filter(Boolean);
  const mark = id => links.forEach(a => {
    const on = a.hash === `#${id}`;
    if (on) {
      a.setAttribute('aria-current', 'location');
      list.scrollTo({ left: a.offsetLeft - 12, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    } else a.removeAttribute('aria-current');
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) mark(e.target.id); });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => io.observe(s));
});
