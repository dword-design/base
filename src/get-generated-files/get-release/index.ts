import packageName from 'depcheck-package-name';

import type { Base } from '@/src';

export default (base: Base) => ({
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    packageName`@semantic-release/changelog`,
    base.config.npmPublish
      ? packageName`@semantic-release/npm`
      : [packageName`@semantic-release/npm`, { npmPublish: false }],
    base.config.deployAssets.length > 0
      ? [
          packageName`@semantic-release/github`,
          { assets: base.config.deployAssets },
        ]
      : packageName`@semantic-release/github`,
    [
      packageName`@semantic-release/git`,
      {
        message:
          'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    ...base.config.deployPlugins,
  ],
});
