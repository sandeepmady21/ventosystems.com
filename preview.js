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
    ['autonomy', 'autonomy'], ['lab', 'lab'], ['cyber', 'cyber'], ['general', 'general'],
    ['public-sector', 'public-sector'], ['government', 'public-sector'],
  ]);
  const projects = new Map([
    ['tarivo', ['Tarivo', 'business']], ['ap-automation', ['AP Automation', 'business']],
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
    ['cyber', 'What would you like Vento Cyber to look at?'],
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
