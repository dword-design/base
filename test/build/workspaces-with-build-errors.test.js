import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import P from 'path'
import { endent } from '@dword-design/functions'
import { exists } from 'fs-extra'

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
            "name": "a"
          }

        `,
        'src/index.js': 'foo bar',
      },
      b: {
        'package.json': endent`
          {
            "name": "b",
            "dependencies": {
              "a": "^1.0.0"
            }
          }

        `,
        'src/index.js': 'export default 1',
      },
    },
  })
  let stdout
  try {
    await spawn('base', ['build'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Unexpected token, expected ";"')
  expect(await exists(P.resolve('packages', 'b', 'dist'))).toBeFalsy()
})
