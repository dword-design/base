import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import { outputFile } from 'fs-extra'
import { spawn } from 'child-process-promise'
import P from 'path'

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
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    expect(await getPackageString()).toMatch('"main": "dist/index.scss"')
  }),
  empty: () => withLocalTmpDir(async () => {
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    expect(await getPackageString()).toEqual(endent`
      {
        "version": "1.0.0",
        "description": "",
        "license": "MIT",
        "author": "Sebastian Landwehr <info@dword-design.de>",
        "main": "dist/index.js",
        "files": [
          "dist"
        ],
        "scripts": {
          "commit": "base commit",
          "depgraph": "base depgraph",
          "prepare": "base prepare",
          "prepublishOnly": "base prepublishOnly",
          "release": "base release",
          "test": "base test"
        }
      }
  
    `)
  }),
  'existing package': () => withLocalTmpDir(async () => {
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    await outputFile('package.json', endent`
      {
        "name": "foo",
        "version": "1.1.0",
        "description": "foo bar",
        "baseConfig": "foo",
        "license": "ISC",
        "author": "foo bar",
        "files": "foo",
        "main": "dist/index.scss",
        "workspaces": true,
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
          "bar": "^1.0.0"
        }
      }
  
    `)
    expect(await getPackageString()).toEqual(endent`
      {
        "name": "foo",
        "version": "1.1.0",
        "private": true,
        "description": "foo bar",
        "keywords": [
          "foo",
          "bar"
        ],
        "license": "MIT",
        "author": "Sebastian Landwehr <info@dword-design.de>",
        "main": "dist/index.js",
        "bin": {
          "foo": "./dist/cli.js"
        },
        "files": [
          "dist"
        ],
        "workspaces": [
          "packages/*"
        ],
        "scripts": {
          "commit": "base commit",
          "depgraph": "base depgraph",
          "prepare": "base prepare",
          "prepublishOnly": "base prepublishOnly",
          "release": "base release",
          "test": "base test"
        },
        "dependencies": {
          "foo": "^1.0.0"
        },
        "devDependencies": {
          "bar": "^1.0.0"
        },
        "baseConfig": "foo"
      }
  
    `)
  }),
  'git repo': () => withLocalTmpDir(async () => {
    await spawn('git', ['init'])
    await spawn('git', ['remote', 'add', 'origin', 'git@github.com:bar/foo.git'])
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    expect(await getPackageString()).toEqual(endent`
      {
        "version": "1.0.0",
        "description": "",
        "repository": "bar/foo",
        "license": "MIT",
        "author": "Sebastian Landwehr <info@dword-design.de>",
        "main": "dist/index.js",
        "files": [
          "dist"
        ],
        "scripts": {
          "commit": "base commit",
          "depgraph": "base depgraph",
          "prepare": "base prepare",
          "prepublishOnly": "base prepublishOnly",
          "release": "base release",
          "test": "base test"
        }
      }

    `)
  }),
  'non-github repo': () => withLocalTmpDir(async () => {
    await spawn('git', ['init'])
    await spawn('git', ['remote', 'add', 'origin', 'git@special.com:bar/foo.git'])
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    await expect(getPackageString()).rejects.toThrow('Only GitHub repositories are supported.')
  }),
  private: () => withLocalTmpDir(async () => {
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    await outputFile('package.json', endent`
      {
        "private": true
      }
  
    `)
    expect(await getPackageString()).toMatch('"private": true')
  }),
  'sub-folder': () => withLocalTmpDir(async () => {
    await spawn('git', ['init'])
    await spawn('git', ['remote', 'add', 'origin', 'git@github.com:bar/foo.git'])
    await outputFiles({
      test: {},
    })
    process.chdir('test')
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    await expect(await getPackageString()).toEqual(endent`
      {
        "version": "1.0.0",
        "description": "",
        "license": "MIT",
        "author": "Sebastian Landwehr <info@dword-design.de>",
        "main": "dist/index.js",
        "files": [
          "dist"
        ],
        "scripts": {
          "commit": "base commit",
          "depgraph": "base depgraph",
          "prepare": "base prepare",
          "prepublishOnly": "base prepublishOnly",
          "release": "base release",
          "test": "base test"
        }
      }
  
    `)
  }),
  'workspace-with-git-repo': () => withLocalTmpDir(async () => {
    await spawn('git', ['init'])
    await spawn('git', ['remote', 'add', 'origin', 'git@github.com:bar/foo.git'])
    await outputFiles({
      'package.json': endent`
        {
          "workspaces": ["packages/*"]
        }
      `,
      'packages/a': {},
    })
    process.chdir(P.join('packages', 'a'))
    const getPackageString = stealthyRequire(require.cache, () => require('../src/get-package-string'))
    await expect(await getPackageString()).toEqual(endent`
      {
        "version": "1.0.0",
        "description": "",
        "repository": "bar/foo",
        "license": "MIT",
        "author": "Sebastian Landwehr <info@dword-design.de>",
        "main": "dist/index.js",
        "files": [
          "dist"
        ],
        "scripts": {
          "commit": "base commit",
          "depgraph": "base depgraph",
          "prepare": "base prepare",
          "prepublishOnly": "base prepublishOnly",
          "release": "base release",
          "test": "base test"
        }
      }
  
    `)
  }),  
}