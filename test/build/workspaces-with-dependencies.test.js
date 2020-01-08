import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import P from 'path'
import { endent } from '@dword-design/functions'
import { symlink, ensureDir } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "workspaces": ["packages/*"]
      }

    `,
    packages: {
      a: {
        'package.json': endent`
          {
            "name": "a",
            "version": "1.0.0",
            "main": "dist/index.js",
            "scripts": {
              "prepublishOnly": "base build"
            },
            "dependencies": {
              "b": "^1.0.0"
            }
          }

        `,
        'src/index.js': endent`
          import b from 'b'

          export default b
        `,
      },
      b: {
        'package.json': endent`
          {
            "name": "b",
            "version": "1.0.0",
            "main": "dist/index.js",
            "scripts": {
              "prepublishOnly": "base build"
            }
          }

        `,
        'src/index.js': 'export default 1',
      },
    },
  })
  await ensureDir('node_modules')
  await symlink(P.resolve('packages/b'), P.join('node_modules', 'b'))
  await spawn('base', ['build'], { stdio: 'inherit' })
  expect(require(P.resolve('packages', 'a', 'dist'))).toEqual(1)
})
