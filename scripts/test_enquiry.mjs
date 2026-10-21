// Behavioral checks for the shipped buildless script; no browser or packages required.
// Run: node --test scripts/test_enquiry.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/company.js', import.meta.url), 'utf8');

function page(search = '', { routing = true, formPresent = true, clipboardFails = false } = {}) {
  const elements = new Map();
  const clipboard = [];
  let focused = null;
  function element(id, options) {
    const listeners = new Map();
    const el = {
      value: options?.[0]?.[0] || '', hidden: false, textContent: '', href: '', validityMessage: '',
      options: options?.map(([value, text]) => ({ value, text })) || [],
      get selectedOptions() { return this.options.filter(option => option.value === this.value); },
      setCustomValidity(message) { this.validityMessage = message; },
      focus() { focused = id; },
      select() { this.selected = true; },
      addEventListener(type, listener) { listeners.set(type, [...(listeners.get(type) || []), listener]); },
      async emit(type, target = el) {
        const event = { target, prevented: false, preventDefault() { this.prevented = true; } };
        for (const listener of listeners.get(type) || []) await listener(event);
        return event;
      }
    };
    elements.set(id, el);
    return el;
  }
  if (formPresent) {
    element('enquiry-form');
    element('enquiry-area', [['general', 'A conversation with Vento'], ['business', 'Business systems'], ['private-ai', 'Private AI'], ['safety', 'Safety systems'], ['autonomy', 'Autonomy & machines'], ['lab', 'Research & Vento Lab'], ['cyber', 'Vento Cyber']]);
    if (routing) {
      element('enquiry-topic', [['general', 'General enquiry'], ['travio', 'Travio'], ['ap-automation', 'AP Automation'], ['auditproof', 'AuditProof'], ['practice-tracker', 'Practice Tracker'], ['distribution', 'Distribution operations'], ['perception-control', 'Perception & control']]);
      element('enquiry-path', [['general', 'Not sure yet'], ['product', 'Product enquiry'], ['engineering', 'Engineering project'], ['research', 'Research collaboration']]);
    }
    for (const name of ['name', 'company', 'message', 'preview', 'draft', 'open', 'copy']) element('enquiry-' + name);
    element('form-status');
    elements.get('enquiry-preview').hidden = true;
    elements.get('enquiry-form').reportValidity = () => ['name', 'message'].every(name => {
      const el = elements.get('enquiry-' + name);
      return el.value !== '' && !el.validityMessage;
    });
  }
  runInNewContext(source, {
    document: { documentElement: { classList: { add() {} } }, querySelector: () => null, getElementById: id => elements.get(id) || null },
    location: { search }, URLSearchParams,
    navigator: { clipboard: { async writeText(text) { if (clipboardFails) throw new Error('clipboard unavailable'); clipboard.push(text); } } }
  });
  const get = name => elements.get(name.startsWith('form-') ? name : 'enquiry-' + name);
  return {
    get, clipboard, focused: () => focused,
    async edit(name, value, type = 'input') { get(name).value = value; await get('form').emit(type, get(name)); },
    async submit() { return get('form').emit('submit'); },
    fill() { get('name').value = 'Rhea Patel'; get('company').value = 'A&B / μ'; get('message').value = 'Review our import workflow.\nKeep the evidence trail.'; },
    email() { return new URL(get('open').href); }
  };
}

test('specific product wins conflicting area; visible routing survives into encoded email', async () => {
  const p = page('?need=safety&topic=travio&path=engineering');
  assert.equal(p.get('topic').value, 'travio');
  assert.equal(p.get('area').value, 'business');
  assert.equal(p.get('path').value, 'engineering');
  p.fill();
  assert.equal((await p.submit()).prevented, true);
  assert.equal(p.get('preview').hidden, false);
  assert.equal(p.focused(), 'enquiry-draft');
  const email = p.email();
  assert.equal(email.protocol, 'mailto:');
  assert.equal(email.pathname, 'hello@ventosystems.com');
  assert.equal(email.searchParams.get('subject'), 'Travio — Engineering project — A&B / μ');
  assert.equal(email.searchParams.get('body'), 'Hello Vento,\n\nReview our import workflow.\nKeep the evidence trail.\n\nArea: Business systems\nInterest: Travio\nEngagement: Engineering project\nName: Rhea Patel\nOrganization: A&B / μ\n');
  assert.match(p.get('draft').value, /Subject: Travio — Engineering project/);
  assert.match(p.get('form-status').textContent, /Nothing has been sent/);
});

test('every supported product routes to its intended area', () => {
  for (const topic of ['travio', 'ap-automation', 'auditproof', 'practice-tracker', 'distribution']) {
    const p = page(`?topic=${topic}&path=product`);
    assert.equal(p.get('topic').value, topic);
    assert.equal(p.get('area').value, 'business');
    assert.equal(p.get('path').value, 'product');
  }
  const p = page('?topic=perception-control&path=research');
  assert.equal(p.get('area').value, 'autonomy');
  assert.equal(p.get('path').value, 'research');
});

test('unknown and adversarial routing values do not become selections or draft content', async () => {
  const p = page('?need=__proto__&topic=constructor&path=%3Cscript%3E');
  for (const control of ['area', 'topic', 'path']) assert.equal(p.get(control).value, 'general');
  p.fill(); await p.submit();
  assert.doesNotMatch(p.get('draft').value, /__proto__|constructor|script/);
  const validArea = page('?need=private-ai&topic=unknown&path=unknown');
  assert.equal(validArea.get('area').value, 'private-ai');
  assert.equal(validArea.get('topic').value, 'general');
});

test('topic and area edits stay consistent and invalidate an already prepared draft', async () => {
  const p = page('?topic=travio'); p.fill(); await p.submit();
  await p.edit('topic', 'perception-control', 'change');
  assert.equal(p.get('area').value, 'autonomy');
  assert.equal(p.get('preview').hidden, true);
  assert.equal(p.get('draft').value, '');
  assert.equal(p.get('open').href, 'mailto:hello@ventosystems.com');
  await p.submit();
  assert.match(p.email().searchParams.get('subject'), /Perception & control/);
  await p.edit('area', 'safety', 'change');
  assert.equal(p.get('topic').value, 'general');
  await p.submit();
  assert.match(p.email().searchParams.get('subject'), /^Safety systems/);
  await p.edit('message', 'An updated requirement.');
  assert.equal(p.get('preview').hidden, true);
});

test('empty or whitespace-only required fields use native validation and recover after edits', async () => {
  const p = page();
  await p.submit();
  assert.equal(p.get('preview').hidden, true);
  assert.equal(p.get('name').validityMessage, 'Please enter your name.');
  await p.edit('name', '   '); await p.edit('message', '\n  ');
  await p.submit();
  assert.equal(p.get('preview').hidden, true);
  assert.notEqual(p.get('message').validityMessage, '');
  await p.edit('name', 'Rhea'); await p.edit('message', 'Discuss a system.');
  assert.equal(p.get('name').validityMessage, '');
  assert.equal(p.get('message').validityMessage, '');
  await p.submit();
  assert.equal(p.get('preview').hidden, false);
  assert.doesNotMatch(p.email().searchParams.get('body'), /Organization:/);
});

test('clipboard success and denial retain a usable draft without implying delivery', async () => {
  const p = page('?topic=auditproof'); p.fill(); await p.submit();
  await p.get('copy').emit('click');
  assert.deepEqual(p.clipboard, [p.get('draft').value]);
  assert.match(p.get('form-status').textContent, /Paste it into your email app/);
  await p.edit('path', 'research', 'change');
  await p.get('copy').emit('click');
  assert.equal(p.clipboard.length, 1);
  const fallback = page('', { clipboardFails: true }); fallback.fill(); await fallback.submit();
  await fallback.get('copy').emit('click');
  assert.equal(fallback.get('draft').selected, true);
  assert.equal(fallback.get('preview').hidden, false);
});

test('shared script remains safe on subpages and older cached contact HTML', async () => {
  assert.doesNotThrow(() => page('', { formPresent: false }));
  const p = page('?need=private-ai&topic=travio&path=engineering', { routing: false });
  p.fill(); await p.submit();
  assert.match(p.email().searchParams.get('subject'), /^Private AI/);
  assert.doesNotMatch(p.email().searchParams.get('body'), /Interest:|Engagement:/);
});
