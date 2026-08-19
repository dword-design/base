import { test } from '@playwright/test';
import { expect } from 'playwright-expect-snapshot';

import { Base } from '@/src';
import self from '.'

test('do not sync keywords', () => {
  const base = new Base({ syncKeywords: false });
  expect(self(base)).toMatchSnapshot();
});

test('valid', () => {
  const base = new Base();
  expect(self(base)).toMatchSnapshot();
});

/**
 * Manual Tests
 *
 * - Creates branch action-sync-node-meta
 * - Changing the description updates the PR
 * - Changing the topics updates the PR
 */
