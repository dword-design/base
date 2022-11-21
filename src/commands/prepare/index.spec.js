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
import fs from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'

import { Base } from '@/src/index.js'

export default tester(
  {
    'additional allowed match': async () => {
      await fs.outputFile('foo.txt', '')

      const base = new Base({ allowedMatches: ['foo.txt'] })
      await base.prepare()
      expect(
        globby('*', { dot: true }) |> await |> includes('foo.txt')
      ).toBeTruthy()
    },
    'commit valid': async () => {
      await execa.command('git init')
      await execa.command('git config user.email "foo@bar.de"')
      await execa.command('git config user.name "foo"')

      const base = new Base()
      await base.prepare()
      await execa('git', ['commit', '--allow-empty', '-m', 'fix: foo'])
    },
    'commit with linting errors': async () => {
      await execa.command('git init')
      await execa.command('git config user.email "foo@bar.de"')
      await execa.command('git config user.name "foo"')

      const base = new Base()
      await base.prepare()
      await expect(
        execa.command('git commit --allow-empty -m foo')
      ).rejects.toThrow('subject may not be empty')
    },
    'custom prepare': async () => {
      const base = new Base({ prepare: () => fs.outputFile('foo.txt', 'bar') })
      await base.prepare()
      expect(await fs.readFile('foo.txt', 'utf8')).toEqual('bar')
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
        'package.json': JSON.stringify({
          author: 'dword-design',
          license: 'MIT',
          name: 'foo',
        }),
        'src/index.js': 'export default 1',
        'yarn.lock': '',
      })

      const base = new Base()
      await base.prepare()
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toMatchSnapshot(this)
      expect(await fs.readFile('README.md', 'utf8')).toMatchSnapshot(this)
      expect(await fs.readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
    },
  },
  [testerPluginTmpDir()]
)
