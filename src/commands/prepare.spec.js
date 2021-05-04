import {
  endent,
  identity,
  includes,
  keyBy,
  mapValues,
  stubTrue,
} from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import { readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import proxyquire from '@dword-design/proxyquire'

export default tester(
  {
    'additional allowed match': async () => {
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
      const self = proxyquire('./prepare', {})
      await self()
      expect(
        globby('*', { dot: true }) |> await |> includes('foo.txt')
      ).toBeTruthy()
    },
    'commit with linting errors': async () => {
      await execa.command('git init')
      const self = proxyquire('./prepare', {})
      await self()
      await expect(
        execa.command('git commit --allow-empty -m foo')
      ).rejects.toThrow('subject may not be empty')
    },
    'custom prepare': async () => {
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
    },
    async valid() {
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
      const self = proxyquire('./prepare', {})
      await self()
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toMatchSnapshot(this)
      expect(await readFile('README.md', 'utf8')).toMatchSnapshot(this)
      expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
    },
    'valid commit': async () => {
      await execa.command('git init')
      const self = proxyquire('./prepare', {})
      await self()
      await execa('git', ['commit', '--allow-empty', '-m', 'fix: foo'])
    },
  },
  [testerPluginTmpDir()]
)
