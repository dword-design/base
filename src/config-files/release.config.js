import { property } from '@dword-design/functions'
import getPackageName from 'get-package-name'
import parsePkgName from 'parse-pkg-name'
import packageConfig from '../package-config'

export default {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    getPackageName(require.resolve('@semantic-release/changelog')),
    getPackageName(require.resolve('@semantic-release/github')),
    ...[packageConfig.private
      ? [getPackageName(require.resolve('@semantic-release/npm')), { npmPublish: false }]
      : getPackageName(require.resolve('@semantic-release/npm'))
    ],
    ...(packageConfig.deploy
      ? (() => {
          const name = packageConfig.name |> parsePkgName |> property('name')
          return [
            [
              getPackageName(
                require.resolve('@eclass/semantic-release-ssh-commands')
              ),
              {
                publishCmd: `source ~/.nvm/nvm.sh && cd /var/www/${name} && deploy`,
              },
            ],
          ]
        })()
      : []),
    getPackageName(require.resolve('@semantic-release/git')),
  ],
}
