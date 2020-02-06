import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
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
        "depgraph": "base depgraph",
        "prepare": "base prepare",
        "prepublishOnly": "base prepublishOnly",
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
})
