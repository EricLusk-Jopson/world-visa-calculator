import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compareSnapshots } from './contentCheck';
import type { ContentSnapshot } from './types';

const snap = (href: string): ContentSnapshot => ({
  url: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madagaskar',
  contentType: 'text/html',
  updatedAt: null,
  text: 'Madagascar',
  links: [{ text: 'Bilateral relations', href }],
});

describe('compareSnapshots link targets', () => {
  it('treats a front-controller spelling of the same target as unchanged', () => {
    const plain = 'https://mfa.gov.rs/en/foreign-policy/bilateral-cooperation/madagascar';
    const viaIndex = 'https://mfa.gov.rs/index%2ephp/en/foreign-policy/bilateral-cooperation/madagascar';
    assert.equal(compareSnapshots(snap(plain), snap(viaIndex)).status, 'unchanged');
    assert.equal(compareSnapshots(snap(viaIndex), snap(plain.replace('/en/', '/index.php/en/'))).status, 'unchanged');
  });

  it('still reports a real target change', () => {
    const result = compareSnapshots(
      snap('https://mfa.gov.rs/en/foreign-policy/bilateral-cooperation/madagascar'),
      snap('https://mfa.gov.rs/en/foreign-policy/bilateral-cooperation/mauritius'),
    );
    assert.equal(result.status, 'links-changed');
  });
});
