import { expect, test } from '@playwright/test';

import { Base } from '@/src';

test('do not sync keywords', () => {
  const base = new Base({ syncKeywords: false });

  expect(
    JSON.stringify(base.getGithubSyncMetadataConfig(), undefined, 2),
  ).toMatchSnapshot();
});

test('valid', () => {
  const base = new Base();

  expect(
    JSON.stringify(base.getGithubSyncMetadataConfig(), undefined, 2),
  ).toMatchSnapshot();
});

/**
 * Manual Tests
 *
 * - Creates branch action-sync-node-meta
 * - Changing the description updates the PR
 * - Changing the topics updates the PR
 */
