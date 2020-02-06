import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await spawn('git', ['init'])
  await spawn('git', ['remote', 'add', 'origin', 'git@github.com:bar/foo.git'])
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
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
        "depgraph": "base depgraph",
        "prepare": "base prepare",
        "prepublishOnly": "base prepublishOnly",
        "test": "base test"
      }
    }
  ` + '\n')
})
