import getPackageName from 'get-package-name'

import config from '../config'

export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    getPackageName(require.resolve('@semantic-release/changelog')),
    config.npmPublish
      ? getPackageName(require.resolve('@semantic-release/npm'))
      : [
          getPackageName(require.resolve('@semantic-release/npm')),
          { npmPublish: false },
        ],
    ...config.deployPlugins,
    config.deployAssets.length
      ? [
          getPackageName(require.resolve('@semantic-release/github')),
          {
            assets: config.deployAssets,
          },
        ]
      : getPackageName(require.resolve('@semantic-release/github')),
    getPackageName(require.resolve('@semantic-release/git')),
  ],
}
