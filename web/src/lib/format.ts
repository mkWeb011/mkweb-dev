/** Formatting helpers. Pure functions, no React — easy to test. */

/** "https://www.ses.com/" → "ses.com" */
export function hostOf(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/** "2026-03-14T09:00:00Z" → "14 Mar 2026". Returns '' for null/invalid. */
export function formatDate(iso: string | null | undefined, locale = 'en-GB'): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Current time in a time zone as "HH:MM". `now` is injectable for tests. */
export function timeIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);
}

/** Rough reading time: ~220 words per minute, minimum 1. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Join class names, skipping falsy values: cx('a', ok && 'b') */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
