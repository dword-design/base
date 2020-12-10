import packageName from 'depcheck-package-name'

import config from '@/src/config'

export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    packageName`@semantic-release/changelog`,
    config.npmPublish
      ? packageName`@semantic-release/npm`
      : [packageName`@semantic-release/npm`, { npmPublish: false }],
    ...config.deployPlugins,
    config.deployAssets.length
      ? [
          packageName`@semantic-release/github`,
          {
            assets: config.deployAssets,
          },
        ]
      : packageName`@semantic-release/github`,
    packageName`@semantic-release/git`,
  ],
}
