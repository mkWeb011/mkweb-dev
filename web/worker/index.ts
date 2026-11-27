/**
 * Cloudflare Worker for mkweb-dev.com
 *
 * The site itself is the static export in `out/`, served by Cloudflare as
 * static assets (free, unlimited). This Worker runs ONLY for /api/* —
 * see `assets.run_worker_first` in wrangler.jsonc — and has one job:
 * receive the "Start a project" brief and email it via Resend.
 *
 *   POST /api/inquiry
 *     Accept: application/json  → { ok: true } | { ok: false, errors }   (fetch from StartProject)
 *     otherwise                  → 303 redirect to /thanks/              (no-JS browser form post)
 */
import { INQUIRY_FORM_NAME, inquirySteps } from '../src/content/inquiry';
import {
  firstInvalidStep,
  parseInquiry,
  summarizeInquiry,
  validateStep,
  type InquiryValues,
} from '../src/lib/inquiry';

/** Bindings and settings — `vars` in wrangler.jsonc, secrets in the dashboard. */
export interface Env {
  /** Static files from `out/` (assets.binding in wrangler.jsonc). */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Secret: Resend API key. Never in code or wrangler.jsonc. */
  RESEND_API_KEY?: string;
  /** Where briefs are delivered. */
  INQUIRY_TO: string;
  /** Sender on your verified Resend domain, e.g. "mkweb-dev <inquiry@mkweb-dev.com>". */
  INQUIRY_FROM: string;
}

export interface Email {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
}

export type SendEmail = (email: Email, env: Env) => Promise<void>;

/** Anything bigger than this is not a project brief. */
const MAX_BODY_BYTES = 32 * 1024;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/inquiry' || pathname === '/api/inquiry/') {
      return handleInquiry(request, env);
    }
    if (pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'Not found' }, 404);
    }
    // Not reached in production (run_worker_first only covers /api/*),
    // but keeps `wrangler dev` and future routes safe.
    return env.ASSETS.fetch(request);
  },
};

/**
 * The whole request → response flow. `send` is injectable so tests can
 * replace Resend with a fake and inspect the email instead of sending it.
 */
export async function handleInquiry(request: Request, env: Env, send: SendEmail = sendWithResend): Promise<Response> {
  const wantsJson = (request.headers.get('Accept') ?? '').includes('application/json');

  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405, { Allow: 'POST' });
  }
  const length = Number(request.headers.get('Content-Length') ?? '0');
  if (length > MAX_BODY_BYTES) {
    return json({ ok: false, error: 'Too large' }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'Expected form data' }, 400);
  }

  // Honeypot: people never see this field, bots fill everything.
  // Pretend success so the bot learns nothing — but send nothing.
  const bot = form.get('bot-field');
  if (typeof bot === 'string' && bot.trim() !== '') {
    return success(wantsJson);
  }

  // Same rules as the browser — imported from the same file.
  const values = parseInquiry(inquirySteps, form);
  const invalid = firstInvalidStep(inquirySteps, values);
  if (invalid !== -1) {
    const errors = validateStep(inquirySteps[invalid]!, values);
    return wantsJson
      ? json({ ok: false, step: invalid, errors }, 422)
      : html('Some answers are missing. Please go back and complete the form.', 422);
  }

  try {
    await send(buildEmail(values, env), env);
  } catch (error) {
    console.error('[inquiry] email failed:', error);
    return wantsJson
      ? json({ ok: false, error: 'Could not send' }, 502)
      : html(`The brief could not be sent. Please email ${env.INQUIRY_TO} instead.`, 502);
  }

  return success(wantsJson);
}

/** Plain-text email: easy to read on a phone, impossible to break with HTML injection. */
export function buildEmail(values: InquiryValues, env: Env): Email {
  const text = (name: string) => {
    const v = values[name];
    return Array.isArray(v) ? v.join(', ') : (v ?? '');
  };
  const name = text('name');
  const services = text('services');
  return {
    from: env.INQUIRY_FROM,
    to: [env.INQUIRY_TO],
    // "Reply" in your mail app goes straight to the client.
    reply_to: text('email'),
    subject: `New project brief: ${name}${services ? ` — ${services}` : ''}`.slice(0, 180),
    text: [
      `New "${INQUIRY_FORM_NAME}" brief from mkweb-dev.com`,
      '',
      summarizeInquiry(inquirySteps, { ...values, message: '' }),
      '',
      'Message:',
      text('message'),
    ].join('\n'),
  };
}

/** Resend REST API — one POST, no SDK needed. */
export const sendWithResend: SendEmail = async (email, env) => {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(email),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
};

// ---------------------------------------------------------------------------

function success(wantsJson: boolean): Response {
  return wantsJson ? json({ ok: true }, 200) : new Response(null, { status: 303, headers: { Location: '/thanks/' } });
}

function json(body: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

function html(message: string, status: number): Response {
  const page = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Start a project</title><body style="font:18px/1.5 system-ui;background:#131313;color:#f2efe9;padding:10vh 8vw"><p>${message}</p><p><a style="color:#9cc2ff" href="/#start">Back to the form</a></p>`;
  return new Response(page, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
