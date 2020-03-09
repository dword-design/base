import withLocalTmpDir from 'with-local-tmp-dir'
import { endent, property } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import { outputFile } from 'fs-extra'
import execa from 'execa'

export default {
  'custom config': () => withLocalTmpDir(async () => {
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
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    expect(getPackageConfig() |> await |> property('main')).toEqual('dist/index.scss')
  }),
  empty: () => withLocalTmpDir(async () => {
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    expect(getPackageConfig() |> await).toEqual({
      version: '1.0.0',
      description: '',
      license: 'MIT',
      author: 'Sebastian Landwehr <info@dword-design.de>',
      main: 'dist/index.js',
      publishConfig: {
        access: 'public',
      },
      files: [
        'dist',
      ],
      scripts: {
        commit: 'base commit',
        depgraph: 'base depgraph',
        prepare: 'base prepare',
        prepublishOnly: 'base prepublishOnly',
        release: 'base release',
        test: 'base test',
      },
    })
  }),
  'existing package': () => withLocalTmpDir(async () => {
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
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    expect(getPackageConfig() |> await).toEqual({
      name: 'foo',
      version: '1.1.0',
      description: 'foo bar',
      keywords: [
        'foo',
        'bar',
      ],
      license: 'MIT',
      author: 'Sebastian Landwehr <info@dword-design.de>',
      main: 'dist/index.js',
      publishConfig: {
        access: 'public',
      },
      bin: {
        foo: './dist/cli.js',
      },
      files: [
        'dist',
      ],
      scripts: {
        commit: 'base commit',
        depgraph: 'base depgraph',
        prepare: 'base prepare',
        release: 'base release',
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
  'git repo': () => withLocalTmpDir(async () => {
    await execa.command('git init')
    await execa.command('git remote add origin git@github.com:bar/foo.git')
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    expect(getPackageConfig() |> await).toEqual({
      version: '1.0.0',
      description: '',
      repository: 'bar/foo',
      license: 'MIT',
      author: 'Sebastian Landwehr <info@dword-design.de>',
      main: 'dist/index.js',
      publishConfig: {
        access: 'public',
      },
      files: [
        'dist',
      ],
      scripts: {
        commit: 'base commit',
        depgraph: 'base depgraph',
        prepare: 'base prepare',
        prepublishOnly: 'base prepublishOnly',
        release: 'base release',
        test: 'base test',
      },
    })
  }),
  'non-github repo': () => withLocalTmpDir(async () => {
    await execa.command('git init')
    await execa.command('git remote add origin git@special.com:bar/foo.git')
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    await expect(getPackageConfig()).rejects.toThrow('Only GitHub repositories are supported.')
  }),
  private: () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "private": true
      }

    `)
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    expect(getPackageConfig() |> await |> property('private')).toBeTruthy()
  }),
  'sub-folder': () => withLocalTmpDir(async () => {
    await execa.command('git init')
    await execa.command('git remote add origin git@github.com:bar/foo.git')
    await outputFiles({
      test: {},
    })
    process.chdir('test')
    const getPackageConfig = stealthyRequire(require.cache, () => require('./get-package-config'))
    await expect(getPackageConfig() |> await).toEqual({
      version: '1.0.0',
      description: '',
      license: 'MIT',
      author: 'Sebastian Landwehr <info@dword-design.de>',
      main: 'dist/index.js',
      publishConfig: {
        access: 'public',
      },
      files: [
        'dist',
      ],
      scripts: {
        commit: 'base commit',
        depgraph: 'base depgraph',
        prepare: 'base prepare',
        prepublishOnly: 'base prepublishOnly',
        release: 'base release',
        test: 'base test',
      },
    })
  }),
}
