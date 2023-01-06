import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import fs from 'fs-extra'
import outputFiles from 'output-files'

import { Base } from '@/src/index.js'

export default tester(
  {
    'custom config': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({
          baseConfig: 'foo',
          devDependencies: {
            'base-config-foo': '^1.0.0',
          },
        })
      )

      const base = new Base({ packageConfig: { main: 'dist/index.scss' } })
      expect(base.getPackageConfig().main).toEqual('dist/index.scss')
    },
    deploy: async () => {
      await fs.outputFile('package.json', JSON.stringify({ deploy: true }))

      const base = new Base()

      const packageConfig = base.getPackageConfig()
      expect(packageConfig.deploy).toBeTruthy()
    },
    empty() {
      expect(new Base().getPackageConfig()).toMatchSnapshot(this)
    },
    async 'existing package'() {
      await fs.outputFile(
        'package.json',
        JSON.stringify({
          author: 'foo bar',
          bin: {
            foo: './dist/cli.js',
          },
          dependencies: {
            foo: '^1.0.0',
          },
          description: 'foo bar',
          devDependencies: {
            'base-config-bar': '^1.0.0',
          },
          extra: 'foo',
          files: 'foo',
          keywords: ['foo', 'bar'],
          license: 'ISC',
          main: 'dist/index.scss',
          name: 'foo',
          peerDependencies: {
            nuxt: '^1.0.0',
          },
          publishConfig: {
            access: 'public',
          },
          scripts: {
            foo: 'echo \\"foo\\"',
            test: 'echo \\"foo\\"',
          },
          types: 'types.d.ts',
          version: '1.1.0',
        })
      )
      expect(new Base().getPackageConfig()).toMatchSnapshot(this)
    },
    async 'git repo'() {
      await execa.command('git init')
      await execa.command('git remote add origin git@github.com:bar/foo.git')
      expect(new Base().getPackageConfig()).toMatchSnapshot(this)
    },
    'non-github repo': async () => {
      await execa.command('git init')
      await execa.command('git remote add origin git@special.com:bar/foo.git')
      expect(() => new Base().getPackageConfig()).toThrow(
        'Only GitHub repositories are supported.'
      )
    },
    private: () =>
      expect(new Base().getPackageConfig({ private: true })).toBeTruthy(),
    async 'sub-folder'() {
      await execa.command('git init')
      await execa.command('git remote add origin git@github.com:bar/foo.git')
      await outputFiles({
        test: {},
      })
      process.chdir('test')
      expect(new Base().getPackageConfig()).toMatchSnapshot(this)
    },
    'types.d.ts': async () => {
      await fs.outputFile('types.d.ts', '')

      const packageConfig = new Base().getPackageConfig()
      expect(packageConfig.files).toEqual(['dist', 'types.d.ts'])
    },
  },
  [testerPluginTmpDir()]
)
