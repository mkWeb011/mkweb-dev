import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { buildEmail, handleInquiry, type Email, type Env } from '../worker/index';

const env: Env = {
  ASSETS: { fetch: async () => new Response('static', { status: 200 }) },
  RESEND_API_KEY: 'test-key',
  INQUIRY_TO: 'me@example.com',
  INQUIRY_FROM: 'mkweb-dev <inquiry@mkweb-dev.com>',
};

const valid = {
  services: 'Migration, Headless / Next.js',
  platform: 'Webflow',
  pages: '6–15',
  budget: '€3k–8k',
  timeline: 'Flexible',
  name: 'Ana Petrović',
  email: 'ana@studio.rs',
  message: 'Move our Webflow site to Next.js with Sanity and keep the rankings.',
};

function post(fields: Record<string, string>, json = true): Request {
  return new Request('https://mkweb-dev.com/api/inquiry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...(json ? { Accept: 'application/json' } : {}),
    },
    body: new URLSearchParams(fields).toString(),
  });
}

/** Fake Resend: records emails instead of sending them. */
function fakeSend() {
  const sent: Email[] = [];
  return { sent, send: async (email: Email) => void sent.push(email) };
}

test('valid brief → email sent, JSON ok', async () => {
  const { sent, send } = fakeSend();
  const res = await handleInquiry(post(valid), env, send);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0]!.reply_to, 'ana@studio.rs');
  assert.deepEqual(sent[0]!.to, ['me@example.com']);
  assert.match(sent[0]!.subject, /Ana Petrović — Migration, Headless \/ Next\.js/);
  assert.match(sent[0]!.text, /Budget range: €3k–8k/);
  assert.match(sent[0]!.text, /Message:\nMove our Webflow site/);
});

test('no-JS form post → 303 redirect to /thanks/', async () => {
  const { send } = fakeSend();
  const res = await handleInquiry(post(valid, false), env, send);
  assert.equal(res.status, 303);
  assert.equal(res.headers.get('Location'), '/thanks/');
});

test('missing answers → 422 with the first invalid step', async () => {
  const { sent, send } = fakeSend();
  const res = await handleInquiry(post({ ...valid, budget: '', email: 'nope' }), env, send);
  assert.equal(res.status, 422);
  const body = (await res.json()) as { step: number; errors: Record<string, string> };
  assert.equal(body.step, 2);
  assert.ok(body.errors.budget);
  assert.equal(sent.length, 0);
});

test('honeypot filled → looks like success, sends nothing', async () => {
  const { sent, send } = fakeSend();
  const res = await handleInquiry(post({ ...valid, 'bot-field': 'http://spam' }), env, send);
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('email provider down → 502, nothing hidden', async () => {
  const res = await handleInquiry(post(valid), env, async () => {
    throw new Error('Resend 500');
  });
  assert.equal(res.status, 502);
});

test('GET is rejected; oversized body is rejected', async () => {
  const get = await handleInquiry(new Request('https://mkweb-dev.com/api/inquiry'), env);
  assert.equal(get.status, 405);
  const big = new Request('https://mkweb-dev.com/api/inquiry', {
    method: 'POST',
    headers: { 'Content-Length': String(100_000) },
    body: 'x',
  });
  assert.equal((await handleInquiry(big, env)).status, 413);
});

test('router: unknown /api path is 404, everything else goes to static assets', async () => {
  assert.equal((await worker.fetch(new Request('https://mkweb-dev.com/api/nope'), env)).status, 404);
  const page = await worker.fetch(new Request('https://mkweb-dev.com/work/idsa/'), env);
  assert.equal(await page.text(), 'static');
});

test('buildEmail: plain text, subject capped', () => {
  const email = buildEmail({ name: 'x'.repeat(300), services: ['Redesign'], email: 'a@b.co', message: 'Hi' }, env);
  assert.ok(email.subject.length <= 180);
  assert.equal(email.from, env.INQUIRY_FROM);
});
