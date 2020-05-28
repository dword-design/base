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
      config.npmPublish
        ? getPackageName(require.resolve('@semantic-release/npm'))
        : [
            getPackageName(require.resolve('@semantic-release/npm')),
            { npmPublish: false },
          ],
    ],
    ...(packageConfig.private ? [] : config.deployPlugins),
    getPackageName(require.resolve('@semantic-release/git')),
  ],
}
