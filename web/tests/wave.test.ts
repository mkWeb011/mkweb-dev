import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wavePath } from '../src/components/motion/SignalWave';

test('wavePath produces a valid SVG path that starts with M', () => {
  const d = wavePath(0, 120, 12);
  assert.match(d, /^M0 /);
  assert.equal((d.match(/L/g) ?? []).length, 10); // 0..120 step 12 → 11 points
});

test('wavePath is deterministic for the same t', () => {
  assert.equal(wavePath(1.5), wavePath(1.5));
  assert.notEqual(wavePath(0), wavePath(1));
});
