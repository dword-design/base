import withLocalTmpDir from 'with-local-tmp-dir'
import stealthyRequire from 'stealthy-require'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import P from 'path'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
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
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
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
})
