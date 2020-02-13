import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
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
})
