import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cx, formatDate, hostOf, readingMinutes, timeIn } from '../src/lib/format';

test('hostOf strips protocol, www and trailing slash', () => {
  assert.equal(hostOf('https://www.ses.com/'), 'ses.com');
  assert.equal(hostOf('http://shop.mcadventure.com.mt/'), 'shop.mcadventure.com.mt');
  assert.equal(hostOf('https://zignify.net'), 'zignify.net');
});

test('formatDate formats ISO dates and tolerates bad input', () => {
  assert.equal(formatDate('2026-03-14T09:00:00Z'), '14 Mar 2026');
  assert.equal(formatDate(null), '');
  assert.equal(formatDate('not a date'), '');
});

test('timeIn returns HH:MM in the requested time zone', () => {
  // 12:00 UTC in winter = 13:00 in Belgrade (CET, UTC+1)
  const noonUtc = new Date('2026-01-15T12:00:00Z');
  assert.equal(timeIn('Europe/Belgrade', noonUtc), '13:00');
  // In summer Belgrade is UTC+2 (CEST)
  assert.equal(timeIn('Europe/Belgrade', new Date('2026-07-15T12:00:00Z')), '14:00');
});

test('readingMinutes never returns less than 1', () => {
  assert.equal(readingMinutes(''), 1);
  assert.equal(readingMinutes('word '.repeat(660)), 3);
});

test('cx joins truthy class names only', () => {
  assert.equal(cx('a', false, null, undefined, 'b'), 'a b');
});
