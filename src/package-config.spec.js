import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import { outputFile } from 'fs-extra'
import execa from 'execa'

export default {
  'custom config': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          main: 'index.scss',
        }
      `,
        'package.json': endent`
        {
          "baseConfig": "foo",
          "devDependencies": {
            "base-config-foo": "^1.0.0"
          }
        }

      `,
      })
      const { main } = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(main).toEqual('dist/index.scss')
    }),
  empty: () =>
    withLocalTmpDir(() => {
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig).toEqual({
        version: '1.0.0',
        description: '',
        license: 'MIT',
        author: 'Sebastian Landwehr <info@dword-design.de>',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        files: ['dist'],
        scripts: {
          commit: 'base commit',
          dev: 'base dev',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
      })
    }),
  'existing package': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-bar/index.js': '',
        'package.json': endent`
        {
          "name": "foo",
          "version": "1.1.0",
          "description": "foo bar",
          "baseConfig": "bar",
          "license": "ISC",
          "author": "foo bar",
          "files": "foo",
          "main": "dist/index.scss",
          "publishConfig": {
            "access": "public"
          },
          "keywords": [
            "foo",
            "bar"
          ],
          "bin": {
            "foo": "./dist/cli.js"
          },
          "extra": "foo",
          "scripts": {
            "test": "echo \\"foo\\"",
            "foo": "echo \\"foo\\""
          },
          "dependencies": {
            "foo": "^1.0.0"
          },
          "devDependencies": {
            "base-config-bar": "^1.0.0"
          }
        }

      `,
      })
      const packageConfig = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(packageConfig).toEqual({
        name: 'foo',
        version: '1.1.0',
        description: 'foo bar',
        keywords: ['foo', 'bar'],
        license: 'MIT',
        author: 'Sebastian Landwehr <info@dword-design.de>',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        bin: {
          foo: './dist/cli.js',
        },
        files: ['dist'],
        scripts: {
          commit: 'base commit',
          prepare: 'base prepare',
          test: 'base test',
        },
        dependencies: {
          foo: '^1.0.0',
        },
        devDependencies: {
          'base-config-bar': '^1.0.0',
        },
        baseConfig: 'bar',
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
        version: '1.0.0',
        description: '',
        repository: 'bar/foo',
        license: 'MIT',
        author: 'Sebastian Landwehr <info@dword-design.de>',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        files: ['dist'],
        scripts: {
          commit: 'base commit',
          dev: 'base dev',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
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
      const { private: isPrivate } = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(isPrivate).toBeTruthy()
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
      const { deploy } = stealthyRequire(require.cache, () =>
        require('./package-config')
      )
      expect(deploy).toBeTruthy()
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
        version: '1.0.0',
        description: '',
        license: 'MIT',
        author: 'Sebastian Landwehr <info@dword-design.de>',
        main: 'dist/index.js',
        publishConfig: {
          access: 'public',
        },
        files: ['dist'],
        scripts: {
          commit: 'base commit',
          dev: 'base dev',
          prepare: 'base prepare',
          prepublishOnly: 'base prepublishOnly',
          test: 'base test',
        },
      })
    }),
}
