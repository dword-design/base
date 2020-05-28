import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'

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
          '@semantic-release/github',
          '@semantic-release/npm',
          '@semantic-release/git',
        ],
      })
    }),
  private: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify({ private: true }, undefined, 2)
      )
      const config = stealthyRequire(require.cache, () =>
        require('./release.config')
      )
      expect(config).toEqual({
        plugins: [
          '@semantic-release/commit-analyzer',
          '@semantic-release/release-notes-generator',
          '@semantic-release/changelog',
          '@semantic-release/github',
          [
            '@semantic-release/npm',
            {
              npmPublish: false,
            },
          ],
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
          '@semantic-release/github',
          [
            '@semantic-release/npm',
            {
              npmPublish: false,
            },
          ],
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
          '@semantic-release/github',
          [
            '@semantic-release/npm',
            {
              npmPublish: false,
            },
          ],
          'semantic-release-foo',
          '@semantic-release/git',
        ],
      })
    }),
}
