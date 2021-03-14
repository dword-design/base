import { endent } from '@dword-design/functions'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'custom config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          packageConfig: {
            main: 'dist/index.scss',
          },
        }
      `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
            devDependencies: {
              'base-config-foo': '^1.0.0',
            },
          },
          undefined,
          2
        ),
      })
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig.main).toEqual('dist/index.scss')
    }),
  deploy: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "deploy": true
      }

    `
      )
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig.deploy).toBeTruthy()
    }),
  empty: () =>
    withLocalTmpDir(() => {
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig).toEqual({
        author: 'Sebastian Landwehr <info@dword-design.de>',
        description: '',
        files: ['dist'],
        funding: 'https://www.buymeacoffee.com/dword',
        license: 'MIT',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        scripts: {
          'check-unknown-files': 'base check-unknown-files',
          commit: 'base commit',
          dev: 'base dev',
          lint: 'base lint',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
        version: '1.0.0',
      })
    }),
  'existing package': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-bar/index.js': '',
        'package.json': JSON.stringify(
          {
            author: 'foo bar',
            baseConfig: 'bar',
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
          },
          undefined,
          2
        ),
      })
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig).toEqual({
        author: 'Sebastian Landwehr <info@dword-design.de>',
        baseConfig: 'bar',
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
        files: ['dist'],
        funding: 'https://www.buymeacoffee.com/dword',
        keywords: ['foo', 'bar'],
        license: 'MIT',
        name: 'foo',
        peerDependencies: {
          nuxt: '^1.0.0',
        },
        publishConfig: {
          access: 'public',
        },
        scripts: {
          'check-unknown-files': 'base check-unknown-files',
          commit: 'base commit',
          lint: 'base lint',
          prepare: 'base prepare',
          test: 'base test',
        },
        types: 'types.d.ts',
        version: '1.1.0',
      })
    }),
  'git repo': () =>
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command('git remote add origin git@github.com:bar/foo.git')
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig).toEqual({
        author: 'Sebastian Landwehr <info@dword-design.de>',
        description: '',
        files: ['dist'],
        funding: 'https://www.buymeacoffee.com/dword',
        license: 'MIT',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        repository: 'bar/foo',
        scripts: {
          'check-unknown-files': 'base check-unknown-files',
          commit: 'base commit',
          dev: 'base dev',
          lint: 'base lint',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
        version: '1.0.0',
      })
    }),
  'non-github repo': () =>
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command('git remote add origin git@special.com:bar/foo.git')
      await expect(() =>
        stealthyRequire(require.cache, () => require('./package-config'))
      ).toThrow('Only GitHub repositories are supported.')
    }),
  private: () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "private": true
      }

    `
      )
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig.private).toBeTruthy()
    }),
  'sub-folder': () =>
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command('git remote add origin git@github.com:bar/foo.git')
      await outputFiles({
        test: {},
      })
      process.chdir('test')
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      await expect(packageConfig).toEqual({
        author: 'Sebastian Landwehr <info@dword-design.de>',
        description: '',
        files: ['dist'],
        funding: 'https://www.buymeacoffee.com/dword',
        license: 'MIT',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        scripts: {
          'check-unknown-files': 'base check-unknown-files',
          commit: 'base commit',
          dev: 'base dev',
          lint: 'base lint',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
        version: '1.0.0',
      })
    }),
}
