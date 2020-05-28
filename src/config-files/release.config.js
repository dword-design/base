import getPackageName from 'get-package-name'
import packageConfig from '../package-config'
import config from '../config'

export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    getPackageName(require.resolve('@semantic-release/changelog')),
    getPackageName(require.resolve('@semantic-release/github')),
    ...[
      packageConfig.private || !config.npmPublish
        ? [
            getPackageName(require.resolve('@semantic-release/npm')),
            { npmPublish: false },
          ]
        : getPackageName(require.resolve('@semantic-release/npm')),
    ],
    ...(packageConfig.private ? [] : config.deployPlugins),
    getPackageName(require.resolve('@semantic-release/git')),
  ],
}
