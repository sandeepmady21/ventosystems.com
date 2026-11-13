const nav = document.getElementById('preview-nav');
const menu = document.querySelector('.preview-menu');
const solutions = document.querySelector('.solutions');

function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  if (!open) solutions.open = false;
}

menu.hidden = false;
document.documentElement.classList.add('preview-js');
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') === 'false'));
nav.addEventListener('click', event => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.preview-header')) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (solutions.open) {
    solutions.open = false;
    solutions.querySelector('summary').focus();
  } else if (menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});

const form = document.getElementById('brief-form');
if (form) {
  const topics = new Map([
    ['team-extension', 'offshore'],
    ['dedicated-team', 'offshore'],
    ['offshore-development', 'offshore'],
    ['gcc', 'gcc'],
    ['build-operate-transfer', 'transfer'],
  ]);
  const fields = form.elements;
  const result = document.getElementById('draft-result');
  const status = document.getElementById('draft-status');
  const draft = document.getElementById('draft');
  const link = document.getElementById('open-draft');

  const requested = new URLSearchParams(location.search).get('topic');
  fields.interest.value = topics.get(requested) ?? 'choose';

  form.addEventListener('input', () => {
    result.hidden = true;
    status.textContent = '';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = fields.name.value.trim();
    const message = fields.message.value.trim();
    if (!name || !message) {
      status.textContent = 'Enter your name and what you want the team to take on.';
      return;
    }

    const topic = fields.interest.selectedOptions[0].text;
    const company = fields.company.value.trim();
    const recipient = 'hello@ventosystems.com';
    const subject = `Hyderabad enquiry: ${topic}`;
    const body = `Hello Vento,\n\n${message}\n\nName: ${name}${company ? `\nOrganization: ${company}` : ''}`;
    draft.value = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
    link.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    result.hidden = false;
    status.textContent = 'Draft ready. Open it in your email app to send it.';
    draft.focus();
  });
}
