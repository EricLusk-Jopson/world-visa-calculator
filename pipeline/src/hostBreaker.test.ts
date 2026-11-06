import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHostBreaker } from './hostBreaker';

const timeout = { status: 'broken', error: 'This operation was aborted' } as const;
const http500 = { status: 'broken', httpStatus: 500 } as const;
const live = { status: 'live', httpStatus: 200 } as const;

test('trips a host after `threshold` no-response failures in a row', () => {
  const b = createHostBreaker(3);
  assert.equal(b.record('a.example', timeout), false);
  assert.equal(b.record('a.example', timeout), false);
  assert.equal(b.record('a.example', timeout), true);
  assert.equal(b.isTripped('a.example'), true);
  assert.equal(b.isTripped('b.example'), false);
  assert.match(b.skipped('a.example').error!, /a\.example stopped responding .*This operation was aborted/);
  assert.equal(b.skipped('a.example').status, 'broken');
});

test('an answer from the host, even an HTTP error, resets the streak', () => {
  const b = createHostBreaker(3);
  b.record('a.example', timeout);
  b.record('a.example', timeout);
  b.record('a.example', http500);
  b.record('a.example', timeout);
  b.record('a.example', timeout);
  assert.equal(b.isTripped('a.example'), false);
  b.record('a.example', live);
  b.record('a.example', timeout);
  assert.equal(b.isTripped('a.example'), false);
});

test('reports a trip once, and reset clears it', () => {
  const b = createHostBreaker(2);
  b.record('a.example', timeout);
  assert.equal(b.record('a.example', timeout), true);
  assert.equal(b.record('a.example', timeout), false);
  b.reset('a.example');
  assert.equal(b.isTripped('a.example'), false);
  b.record('a.example', timeout);
  assert.equal(b.isTripped('a.example'), false);
});
