import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../assets/company.js', import.meta.url), 'utf8');

// Run the actual browser script with the small DOM surface used by the form.
// Native browser validation is represented by reportValidity; no server is used.
function enquiry(search = '') {
  const element = initial => {
    const listeners = new Map();
    return {
      value: '', hidden: false, textContent: '',
      ...initial,
      addEventListener(type, callback) {
        const callbacks = listeners.get(type) || [];
        callbacks.push(callback);
        listeners.set(type, callbacks);
      },
      emit(type) {
        const event = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
        for (const callback of listeners.get(type) || []) callback(event);
        return event;
      },
      focus() { this.focused = true; },
      select() { this.selected = true; }
    };
  };
  const options = [
    ['general', 'A conversation with Vento'], ['business', 'Business systems'],
    ['private-ai', 'Private AI'], ['safety', 'Safety systems'],
    ['autonomy', 'Autonomy & machines'], ['lab', 'Research & Vento Lab'],
    ['cyber', 'Vento Cyber']
  ].map(([value, text]) => ({ value, text }));
  const area = element({ value: 'general', options });
  Object.defineProperty(area, 'selectedOptions', {
    get() { return options.filter(option => option.value === area.value); }
  });
  const elements = {
    'enquiry-form': element({ valid: true, reportValidity() { return this.valid; } }),
    'enquiry-area': area,
    'enquiry-project': element({ hidden: true }),
    'enquiry-name': element({ value: 'Ada' }),
    'enquiry-company': element({ value: 'Example & Co' }),
    'enquiry-message': element({ value: 'Review invoices & exceptions?\nConnect the records.' }),
    'enquiry-preview': element({ hidden: true }),
    'enquiry-draft': element(), 'form-status': element(),
    'enquiry-open': element({ href: 'mailto:hello@ventosystems.com' }),
    'enquiry-copy': element()
  };
  runInNewContext(source, {
    URLSearchParams,
    location: { search },
    document: {
      documentElement: { classList: { add() {} } },
      querySelector: () => null,
      getElementById: id => elements[id] || null
    }
  });
  return {
    elements, area,
    submit() {
      const event = elements['enquiry-form'].emit('submit');
      assert.equal(event.defaultPrevented, true, 'the script must prepare a draft, not submit');
      const mailto = new URL(elements['enquiry-open'].href);
      return { subject: mailto.searchParams.get('subject'), body: mailto.searchParams.get('body') };
    },
    changeArea(value, event = 'change') {
      area.value = value;
      if (event === 'input') elements['enquiry-form'].emit('input');
      else area.emit(event);
    }
  };
}

test('known projects choose the correct area and survive in both draft representations', () => {
  const cases = [
    ['travio', 'Travio', 'business'], ['ap-automation', 'AP Automation', 'business'],
    ['auditproof', 'AuditProof', 'business'], ['practice-tracker', 'Practice Tracker', 'business'],
    ['operations', 'Operations systems', 'business'], ['mobile-robot', 'Mobile robot', 'autonomy'],
    ['controller', 'Controller firmware', 'autonomy'],
    ['primer', 'Primer', 'lab'], ['gather', 'Gather', 'lab']
  ];
  for (const [key, label, expectedArea] of cases) {
    const form = enquiry(`?project=${key}`);
    assert.equal(form.area.value, expectedArea);
    assert.equal(form.elements['enquiry-project'].hidden, false);
    assert.equal(form.elements['enquiry-project'].textContent, `Enquiry about ${label}`);
    assert.equal(form.elements['enquiry-preview'].hidden, true, 'project context appears before drafting');
    const { subject, body } = form.submit();
    assert.ok(subject.startsWith(`${label} — `));
    assert.ok(subject.endsWith(' — Example & Co'));
    assert.ok(body.includes(`Project: ${label}\n`));
    assert.ok(body.includes('Review invoices & exceptions?\nConnect the records.'));
    assert.equal(form.elements['enquiry-draft'].value,
      `To: hello@ventosystems.com\nSubject: ${subject}\n\n${body}`);
    assert.equal(form.elements['enquiry-preview'].hidden, false);
  }
});

test('a known project resolves a conflicting need consistently', () => {
  const form = enquiry('?need=private-ai&project=travio');
  assert.equal(form.area.value, 'business');
  assert.equal(form.elements['enquiry-project'].textContent, 'Enquiry about Travio');
  assert.equal(form.submit().subject, 'Travio — Business systems — Example & Co');
});

test('unknown project values never enter the draft and a valid need still works', () => {
  for (const project of ['unlisted', '__proto__', 'constructor', '<script>alert(1)</script>']) {
    const form = enquiry(`?need=safety&project=${encodeURIComponent(project)}`);
    assert.equal(form.area.value, 'safety');
    assert.equal(form.elements['enquiry-project'].hidden, true);
    assert.equal(form.elements['enquiry-project'].textContent, '');
    const { subject, body } = form.submit();
    assert.equal(subject, 'Safety systems — Example & Co');
    assert.ok(!body.includes('Project:'));
  }
  assert.equal(enquiry('?need=unlisted&project=unlisted').area.value, 'general');
  for (const search of ['', '?need=business']) {
    const form = enquiry(search);
    assert.equal(form.elements['enquiry-project'].hidden, true);
    assert.equal(form.elements['enquiry-project'].textContent, '');
  }
});

test('changing area invalidates the draft and permanently clears the original project', () => {
  for (const event of ['input', 'change']) {
    const form = enquiry('?need=business&project=travio');
    form.submit();
    form.changeArea('private-ai', event);
    assert.equal(form.elements['enquiry-project'].hidden, true);
    assert.equal(form.elements['enquiry-project'].textContent, '');
    assert.equal(form.elements['enquiry-preview'].hidden, true);
    assert.match(form.elements['form-status'].textContent, /Create the email draft again/);
    assert.equal(form.submit().subject, 'Private AI — Example & Co');
    form.changeArea('business', event);
    assert.equal(form.elements['enquiry-project'].hidden, true);
    assert.equal(form.elements['enquiry-project'].textContent, '');
    const { subject, body } = form.submit();
    assert.equal(subject, 'Business systems — Example & Co');
    assert.ok(!body.includes('Project:'));
  }
});

test('editing a message refreshes the draft while retaining a compatible project', () => {
  const form = enquiry('?project=controller');
  form.submit();
  form.elements['enquiry-message'].value = 'A revised requirement';
  form.elements['enquiry-form'].emit('input');
  assert.equal(form.elements['enquiry-preview'].hidden, true);
  assert.equal(form.elements['enquiry-project'].hidden, false);
  assert.equal(form.elements['enquiry-project'].textContent, 'Enquiry about Controller firmware');
  const { subject, body } = form.submit();
  assert.equal(subject, 'Controller firmware — Autonomy & machines — Example & Co');
  assert.ok(body.includes('A revised requirement'));
  assert.ok(!body.includes('Review invoices'));
});

test('native validation and whitespace-only required values cannot create a draft', () => {
  const form = enquiry('?project=travio');
  form.elements['enquiry-form'].valid = false;
  assert.equal(form.submit().subject, null);
  assert.equal(form.elements['enquiry-preview'].hidden, true);
  form.elements['enquiry-form'].valid = true;
  form.elements['enquiry-name'].value = '   ';
  assert.equal(form.submit().subject, null);
  assert.equal(form.elements['enquiry-preview'].hidden, true);
});

test('a silently restored area cannot submit an unrelated project', () => {
  const form = enquiry('?project=travio');
  form.area.value = 'autonomy';
  const { subject, body } = form.submit();
  assert.equal(subject, 'Autonomy & machines — Example & Co');
  assert.ok(!body.includes('Project:'));
  assert.equal(form.elements['enquiry-project'].hidden, true);
  assert.equal(form.elements['enquiry-project'].textContent, '');
});

test('a silently restored area clears visible context even when the form is incomplete', () => {
  const form = enquiry('?project=travio');
  form.area.value = 'safety';
  form.elements['enquiry-form'].valid = false;
  assert.equal(form.submit().subject, null);
  assert.equal(form.elements['enquiry-project'].hidden, true);
  assert.equal(form.elements['enquiry-project'].textContent, '');
  assert.equal(form.elements['enquiry-preview'].hidden, true);
  form.changeArea('business');
  assert.equal(form.elements['enquiry-project'].hidden, true);
});
