import { expect, test } from '@playwright/test';

import { Base } from '@/src';

const tests = {
  'deploy assets': {
    config: { deployAssets: [{ label: 'Foo', path: 'foo.js' }] },
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        ['@semantic-release/npm', { npmPublish: false }],
        [
          '@semantic-release/github',
          { assets: [{ label: 'Foo', path: 'foo.js' }] },
        ],
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
      ],
    },
  },
  'deploy plugins': {
    config: { deployPlugins: ['semantic-release-foo'] },
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        ['@semantic-release/npm', { npmPublish: false }],
        '@semantic-release/github',
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
        'semantic-release-foo',
      ],
    },
  },
  'npm publish': {
    config: { npmPublish: true },
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/github',
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
      ],
    },
  },
  valid: {
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        ['@semantic-release/npm', { npmPublish: false }],
        '@semantic-release/github',
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
      ],
    },
  },
};

for (const [name, testConfig] of Object.entries(tests)) {
  testConfig.config = {
    deployAssets: [],
    deployPlugins: [],
    ...testConfig.config,
  };

  test(name, () =>
    expect(new Base(testConfig.config).getReleaseConfig()).toEqual(
      testConfig.result,
    ),
  );
}
