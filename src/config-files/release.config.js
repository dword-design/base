import getPackageName from 'get-package-name'
import packageConfig from '../package-config'

export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    getPackageName(require.resolve('@semantic-release/changelog')),
    getPackageName(require.resolve('@semantic-release/github')),
    ...[
      packageConfig.private
        ? [
            getPackageName(require.resolve('@semantic-release/npm')),
            { npmPublish: false },
          ]
        : getPackageName(require.resolve('@semantic-release/npm')),
    ],
    getPackageName(require.resolve('@semantic-release/git')),
    ...(packageConfig.deploy
      ? [
          getPackageName(
            require.resolve('@dword-design/semantic-release-vserver')
          ),
        ]
      : []),
  ],
}
