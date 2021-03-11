import {
  endent,
  identity,
  includes,
  keyBy,
  mapValues,
  stubTrue,
} from '@dword-design/functions'
import execa from 'execa'
import { readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'additional allowed match': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'foo.txt': '',
        'node_modules/base-config-foo/index.js': endent`
          module.exports = {
            allowedMatches: [
              'foo.txt',
            ],
          }
        `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      await execa(require.resolve('../cli'), ['prepare'])
      expect(
        globby('*', { dot: true }) |> await |> includes('foo.txt')
      ).toBeTruthy()
    }),
  'custom prepare': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'foo.txt': '',
        'node_modules/base-config-foo/index.js': endent`
          module.exports = {
            prepare: () => console.log('custom prepare'),
          }
        `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      const output = await execa(require.resolve('../cli'), ['prepare'], {
        all: true,
      })
      expect(output.all).toMatch('custom prepare')
    }),
  valid() {
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command(
        'git remote add origin git@github.com:dword-design/bar.git'
      )
      await outputFiles({
        '.env.json': '',
        '.env.schema.json': endent`
        {
          "foo": "bar"
        }
      `,
        '.test.env.json': '',
        'CHANGELOG.md': '',
        'package.json': JSON.stringify(
          {
            author: 'dword-design',
            license: 'MIT',
            name: 'foo',
          },
          undefined,
          2
        ),
        'src/index.js': 'export default 1',
        'yarn.lock': '',
      })
      await execa(require.resolve('../cli'), ['prepare'])
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toEqual({
        '.babelrc.json': true,
        '.commitlintrc.json': true,
        '.cz.json': true,
        '.editorconfig': true,
        '.env.json': true,
        '.env.schema.json': true,
        '.eslintrc.json': true,
        '.git': true,
        '.gitattributes': true,
        '.github': true,
        '.gitignore': true,
        '.gitpod.Dockerfile': true,
        '.gitpod.yml': true,
        '.huskyrc.json': true,
        '.releaserc.json': true,
        '.renovaterc.json': true,
        '.test.env.json': true,
        '.vscode': true,
        'CHANGELOG.md': true,
        'LICENSE.md': true,
        'README.md': true,
        'package.json': true,
        src: true,
        'yarn.lock': true,
      })
      expect(await readFile('README.md', 'utf8')).toMatchSnapshot(this)
      expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
    }),
}
