import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFile('package.json', JSON.stringify({}, undefined, 2))
      const config = stealthyRequire(require.cache, () =>
        require('./release.config')
      )
      expect(config).toEqual({
        plugins: [
          '@semantic-release/commit-analyzer',
          '@semantic-release/release-notes-generator',
          '@semantic-release/changelog',
          '@semantic-release/npm',
          '@semantic-release/github',
          '@semantic-release/git',
        ],
      })
    }),
  'custom config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/foo/index.js': 'module.exports = {}',
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      const config = stealthyRequire(require.cache, () =>
        require('./release.config')
      )
      expect(config).toEqual({
        plugins: [
          '@semantic-release/commit-analyzer',
          '@semantic-release/release-notes-generator',
          '@semantic-release/changelog',
          [
            '@semantic-release/npm',
            {
              npmPublish: false,
            },
          ],
          '@semantic-release/github',
          '@semantic-release/git',
        ],
      })
    }),
  'deploy plugins': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/foo/index.js':
          "module.exports = { deployPlugins: ['semantic-release-foo'] }",
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      const config = stealthyRequire(require.cache, () =>
        require('./release.config')
      )
      expect(config).toEqual({
        plugins: [
          '@semantic-release/commit-analyzer',
          '@semantic-release/release-notes-generator',
          '@semantic-release/changelog',
          [
            '@semantic-release/npm',
            {
              npmPublish: false,
            },
          ],
          'semantic-release-foo',
          '@semantic-release/github',
          '@semantic-release/git',
        ],
      })
    }),
  'deploy assets': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/foo/index.js':
          "module.exports = { deployAssets: [{ path: 'foo.js', label: 'Foo' }] }",
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      const config = stealthyRequire(require.cache, () =>
        require('./release.config')
      )
      expect(config).toEqual({
        plugins: [
          '@semantic-release/commit-analyzer',
          '@semantic-release/release-notes-generator',
          '@semantic-release/changelog',
          [
            '@semantic-release/npm',
            {
              npmPublish: false,
            },
          ],
          [
            '@semantic-release/github',
            {
              assets: [{ path: 'foo.js', label: 'Foo' }],
            },
          ],
          '@semantic-release/git',
        ],
      })
    }),
}
