import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inquirySteps } from '../src/content/inquiry';
import {
  emptyValues,
  encodeInquiry,
  firstInvalidStep,
  MAX_LENGTH,
  parseInquiry,
  summarizeInquiry,
  validateField,
  validateStep,
  type InquiryField,
} from '../src/lib/inquiry';

const allFields = inquirySteps.flatMap((s) => s.fields);

test('field names are unique across steps', () => {
  const names = allFields.map((f) => f.name);
  assert.equal(new Set(names).size, names.length);
});

test('required multi-select needs one option', () => {
  const f: InquiryField = { name: 'x', kind: 'multi', label: 'X', required: true, options: [{ value: 'a' }] };
  assert.ok(validateField(f, []));
  assert.equal(validateField(f, ['a']), null);
});

test('email, url and message rules', () => {
  const email: InquiryField = { name: 'e', kind: 'email', label: 'E', required: true };
  assert.ok(validateField(email, 'not-an-email'));
  assert.equal(validateField(email, 'ana@studio.rs'), null);

  const url: InquiryField = { name: 'u', kind: 'url', label: 'U' };
  assert.equal(validateField(url, ''), null, 'optional and empty is fine');
  assert.equal(validateField(url, 'example.com'), null);
  assert.equal(validateField(url, 'https://www.example.co.uk/about'), null);
  assert.ok(validateField(url, 'not a url'));

  const msg: InquiryField = { name: 'm', kind: 'textarea', label: 'M', required: true };
  assert.ok(validateField(msg, 'too short'));
  assert.equal(validateField(msg, 'A new Webflow site with a booking flow.'), null);
});

test('a fresh form is invalid at step 0; a complete one is valid', () => {
  const values = emptyValues(inquirySteps);
  assert.equal(firstInvalidStep(inquirySteps, values), 0);
  Object.assign(values, {
    services: ['Migration'],
    platform: 'WordPress',
    pages: '6–15',
    budget: '€3k–8k',
    timeline: 'Flexible',
    name: 'Ana Petrović',
    email: 'ana@studio.rs',
    message: 'Move our Wix site to WordPress without losing rankings.',
  });
  assert.equal(firstInvalidStep(inquirySteps, values), -1);
  assert.deepEqual(validateStep(inquirySteps[1]!, values), {});
});

test('encodeInquiry joins checkbox groups and adds form-name', () => {
  const body = new URLSearchParams(
    encodeInquiry('project-inquiry', { services: ['Redesign', 'Migration'], name: '  Ana  ' }, { 'bot-field': '' }),
  );
  assert.equal(body.get('form-name'), 'project-inquiry');
  assert.equal(body.get('services'), 'Redesign, Migration');
  assert.equal(body.get('name'), 'Ana');
  assert.equal(body.get('bot-field'), '');
});

test('summary skips empty answers', () => {
  const text = summarizeInquiry(inquirySteps, { ...emptyValues(inquirySteps), platform: 'Webflow' });
  assert.equal(text, 'Platform or CMS: Webflow');
});

// --- parseInquiry: the server never trusts the browser ---

test('parseInquiry keeps only known fields and allowed options', () => {
  const form = new URLSearchParams({
    services: 'Redesign, Migration, Hacking',
    platform: 'WordPress',
    pages: '999',
    evil: 'ignored',
    name: '  Ana  ',
  });
  const v = parseInquiry(inquirySteps, form);
  assert.deepEqual(v.services, ['Redesign', 'Migration']);
  assert.equal(v.platform, 'WordPress');
  assert.equal(v.pages, '', 'value not in the option list is dropped');
  assert.equal(v.name, 'Ana');
  assert.equal('evil' in v, false);
});

test('parseInquiry accepts the no-JS shape (one entry per checkbox)', () => {
  const form = new URLSearchParams();
  form.append('services', 'Redesign');
  form.append('services', 'Migration');
  form.append('services', 'Redesign');
  assert.deepEqual(parseInquiry(inquirySteps, form).services, ['Redesign', 'Migration']);
});

test('parseInquiry caps long text', () => {
  const v = parseInquiry(inquirySteps, new URLSearchParams({ message: 'x'.repeat(9000), name: 'y'.repeat(500) }));
  assert.equal((v.message as string).length, MAX_LENGTH.message);
  assert.equal((v.name as string).length, MAX_LENGTH.short);
});

test('browser encoding → server parsing round trip', () => {
  const values = {
    ...emptyValues(inquirySteps),
    services: ['Headless / Next.js', 'Hosting & care'],
    platform: 'Not sure — recommend one',
    name: 'Ana',
  };
  const parsed = parseInquiry(inquirySteps, new URLSearchParams(encodeInquiry('project-inquiry', values)));
  assert.deepEqual(parsed.services, values.services);
  assert.equal(parsed.platform, values.platform);
});
