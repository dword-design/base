import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'

import { Base } from '@/src'

export default tester(
  {
    'custom config': async () => {
      await outputFile(
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
      await outputFile('package.json', JSON.stringify({ deploy: true }))

      const base = new Base()

      const packageConfig = base.getPackageConfig()
      expect(packageConfig.deploy).toBeTruthy()
    },
    empty: () =>
      expect(new Base().getPackageConfig()).toEqual({
        author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
        engines: { node: '>=14' },
        files: ['dist'],
        funding: 'https://github.com/sponsors/dword-design',
        license: 'MIT',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        scripts: {
          checkUnknownFiles: 'base checkUnknownFiles',
          commit: 'base commit',
          dev: 'base dev',
          lint: 'base lint',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
        version: '1.0.0',
      }),
    'existing package': async () => {
      await outputFile(
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
      expect(new Base().getPackageConfig()).toEqual({
        author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
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
        engines: { node: '>=14' },
        files: ['dist'],
        funding: 'https://github.com/sponsors/dword-design',
        keywords: ['foo', 'bar'],
        license: 'MIT',
        main: 'dist/index.js',
        name: 'foo',
        peerDependencies: {
          nuxt: '^1.0.0',
        },
        publishConfig: {
          access: 'public',
        },
        scripts: {
          checkUnknownFiles: 'base checkUnknownFiles',
          commit: 'base commit',
          dev: 'base dev',
          prepublishOnly: 'prepublishOnly',
          lint: 'base lint',
          prepare: 'base prepare',
          test: 'base test',
        },
        types: 'types.d.ts',
        version: '1.1.0',
      })
    },
    'git repo': async () => {
      await execa.command('git init')
      await execa.command('git remote add origin git@github.com:bar/foo.git')
      expect(new Base().getPackageConfig()).toEqual({
        author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
        engines: { node: '>=14' },
        files: ['dist'],
        funding: 'https://github.com/sponsors/dword-design',
        license: 'MIT',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        repository: 'dword-design/foo',
        scripts: {
          checkUnknownFiles: 'base checkUnknownFiles',
          commit: 'base commit',
          dev: 'base dev',
          lint: 'base lint',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
        version: '1.0.0',
      })
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
    'sub-folder': async () => {
      await execa.command('git init')
      await execa.command('git remote add origin git@github.com:bar/foo.git')
      await outputFiles({
        test: {},
      })
      process.chdir('test')
      expect(new Base().getPackageConfig()).toEqual({
        author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
        engines: { node: '>=14' },
        files: ['dist'],
        funding: 'https://github.com/sponsors/dword-design',
        license: 'MIT',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        scripts: {
          checkUnknownFiles: 'base checkUnknownFiles',
          commit: 'base commit',
          dev: 'base dev',
          lint: 'base lint',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
        version: '1.0.0',
      })
    },
    'types.d.ts': async () => {
      await outputFile('types.d.ts', '')

      const packageConfig = new Base().getPackageConfig()
      expect(packageConfig.files).toEqual(['dist', 'types.d.ts'])
    },
  },
  [testerPluginTmpDir()]
)
