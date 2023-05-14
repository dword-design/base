import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import fs from 'fs-extra'

import { Base } from '@/src/index.js'

export default tester(
  {
    commonjs: async () => {
      await fs.outputFile('package.json', JSON.stringify({ type: 'commonjs' }))
      expect(new Base().getPackageConfig().type).toEqual('commonjs')
    },
    'custom config': () =>
      expect(
        new Base({
          packageConfig: { main: 'dist/index.scss' },
        }).getPackageConfig().main,
      ).toEqual('dist/index.scss'),
    deploy: async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ deploy: true }),
      )
      expect(new Base().getPackageConfig().deploy).toBeTruthy()
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
          type: 'module',
          types: 'types.d.ts',
          version: '1.1.0',
        }),
      )
      expect(new Base().getPackageConfig()).toMatchSnapshot(this)
    },
    async 'git repo'() {
      await execaCommand('git init')
      await execaCommand('git remote add origin git@github.com:bar/foo.git')
      expect(new Base().getPackageConfig()).toMatchSnapshot(this)
    },
    'non-github repo': async () => {
      await execaCommand('git init')
      await execaCommand('git remote add origin git@special.com:bar/foo.git')
      expect(() => new Base().getPackageConfig()).toThrow(
        'Only GitHub repositories are supported.',
      )
    },
    private: async () => {
      await fs.outputFile('package.json', JSON.stringify({ private: true }))
      expect(new Base().getPackageConfig().private).toBeTruthy()
    },
    'types.d.ts': async () => {
      await fs.outputFile('types.d.ts', '')
      expect(new Base().getPackageConfig().files).toEqual([
        'dist',
        'types.d.ts',
      ])
    },
  },
  [testerPluginTmpDir()],
)
