import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-test/index.js': endent`
      const P = require('path')
      module.exports = {
        commands: {
          prepublishOnly: () => {
            if (P.basename(process.cwd()) === 'a') {
              throw new Error('foo')
            } else {
              console.log('building b')
            }
          },
        },
      }
    `,
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
            "baseConfig": "test",
            "devDependencies": {
              "base-config-test": "^1.0.0"
            }
          }

        `,
        'src/index.js': 'foo bar',
      },
      b: {
        'package.json': endent`
          {
            "name": "b",
            "baseConfig": "test",
            "dependencies": {
              "a": "^1.0.0"
            },
            "devDependencies": {
              "base-config-test": "^1.0.0"
            }
          }

        `,
        'src/index.js': 'export default 1',
      },
    },
  })
  await spawn('base', ['prepare'])
  let stdout
  try {
    await spawn('base', ['prepublishOnly'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('foo')
  expect(stdout).not.toMatch('building b')
})
