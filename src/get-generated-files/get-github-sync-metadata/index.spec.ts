import { expect, test } from '@playwright/test';

import { Base } from '@/src/index.js';

test('do not sync keywords', () => {
  const base = new Base({ syncKeywords: false });
  expect(base.getGithubSyncMetadataConfig()).toMatchSnapshot();
});

test('valid', () => {
  const base = new Base();
  expect(base.getGithubSyncMetadataConfig()).toMatchSnapshot();
});

/**
 * Manual Tests
 *
 * - Creates branch action-sync-node-meta
 * - Changing the description updates the PR
 * - Changing the topics updates the PR
 */
