/**
 * Types and pure logic for the "Start a project" form.
 * No React, no DOM → every rule here is unit-tested in tests/inquiry.test.ts.
 */

export interface InquiryOption {
  /** Sent with the brief and shown in the UI. */
  value: string;
  /** Small secondary line under the option. */
  note?: string;
}

export type InquiryField =
  | { name: string; kind: 'single' | 'multi'; label: string; hint?: string; required?: boolean; options: InquiryOption[] }
  | {
      name: string;
      kind: 'text' | 'email' | 'url' | 'textarea';
      label: string;
      hint?: string;
      required?: boolean;
      autoComplete?: string;
    };

export interface InquiryStep {
  id: string;
  /** Short label for the progress rail. */
  label: string;
  title: string;
  accent: string;
  fields: InquiryField[];
}

/** Current answers: checkbox groups hold arrays, everything else a string. */
export type InquiryValues = Record<string, string | string[]>;

export type InquiryErrors = Record<string, string>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Accepts "example.com", "www.example.com/path" and full https URLs.
const LOOSE_URL = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;
export const MESSAGE_MIN = 20;

export function emptyValues(steps: InquiryStep[]): InquiryValues {
  const values: InquiryValues = {};
  for (const step of steps) {
    for (const field of step.fields) values[field.name] = field.kind === 'multi' ? [] : '';
  }
  return values;
}

/** Validate one field. Returns an error message or null. */
export function validateField(field: InquiryField, value: string | string[] | undefined): string | null {
  if (field.kind === 'multi') {
    const list = Array.isArray(value) ? value : [];
    return field.required && list.length === 0 ? 'Pick at least one option.' : null;
  }

  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) {
    if (!field.required) return null;
    return field.kind === 'single' ? 'Pick one option.' : 'This field is required.';
  }
  if (field.kind === 'email' && !EMAIL.test(text)) return 'Enter a valid email address.';
  if (field.kind === 'url' && !LOOSE_URL.test(text)) return 'Enter a web address like example.com.';
  if (field.kind === 'textarea' && field.required && text.length < MESSAGE_MIN) {
    return `A few more words, please (at least ${MESSAGE_MIN} characters).`;
  }
  return null;
}

/** Validate a whole step. An empty object means the step is valid. */
export function validateStep(step: InquiryStep, values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  for (const field of step.fields) {
    const error = validateField(field, values[field.name]);
    if (error) errors[field.name] = error;
  }
  return errors;
}

/** Index of the first step with an error, or -1 when everything is valid. */
export function firstInvalidStep(steps: InquiryStep[], values: InquiryValues): number {
  return steps.findIndex((step) => Object.keys(validateStep(step, values)).length > 0);
}

/**
 * Body for the POST to /api/inquiry (application/x-www-form-urlencoded —
 * the same format a plain HTML form sends). Checkbox groups are joined into
 * one readable value ("Redesign, Migration"); the Worker splits them again.
 */
export function encodeInquiry(formName: string, values: InquiryValues, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  params.set('form-name', formName);
  for (const [name, value] of Object.entries(values)) {
    params.set(name, Array.isArray(value) ? value.join(', ') : value.trim());
  }
  for (const [name, value] of Object.entries(extra)) params.set(name, value);
  return params.toString();
}

/** Plain-text summary — used for the mailto: fallback if sending fails. */
export function summarizeInquiry(steps: InquiryStep[], values: InquiryValues): string {
  const lines: string[] = [];
  for (const step of steps) {
    for (const field of step.fields) {
      const value = values[field.name];
      const text = Array.isArray(value) ? value.join(', ') : (value ?? '').trim();
      if (text) lines.push(`${field.label}: ${text}`);
    }
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Server side (Cloudflare Worker): turn untrusted form data into InquiryValues
// ---------------------------------------------------------------------------

/** The part of FormData/URLSearchParams we need — keeps this testable without a DOM. */
export interface FormLike {
  getAll(name: string): unknown[];
}

/** Longest accepted value per field kind; anything longer is cut. */
export const MAX_LENGTH = { short: 200, message: 5000 } as const;

/**
 * Read a submitted form defensively: only known fields, only allowed
 * option values, trimmed and length-capped strings. Works for both the
 * JS request (checkboxes joined with ", ") and the no-JS browser POST
 * (one entry per ticked checkbox).
 */
export function parseInquiry(steps: InquiryStep[], form: FormLike): InquiryValues {
  const values = emptyValues(steps);
  for (const step of steps) {
    for (const field of step.fields) {
      const raw = form
        .getAll(field.name)
        .filter((v): v is string => typeof v === 'string')
        .map((v) => v.trim());

      if (field.kind === 'single' || field.kind === 'multi') {
        const allowed = new Set(field.options.map((o) => o.value));
        const picked = raw.flatMap((v) => v.split(',').map((part) => part.trim())).filter((v) => allowed.has(v));
        values[field.name] = field.kind === 'multi' ? [...new Set(picked)] : (picked[0] ?? '');
      } else {
        const max = field.kind === 'textarea' ? MAX_LENGTH.message : MAX_LENGTH.short;
        values[field.name] = (raw[0] ?? '').slice(0, max);
      }
    }
  }
  return values;
}
