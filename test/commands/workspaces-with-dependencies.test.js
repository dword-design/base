import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import P from 'path'
import { endent } from '@dword-design/functions'
import { symlink, ensureDir } from 'fs-extra'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-test/index.js': endent`
      const P = require('path')
      module.exports = {
        commands: {
          prepublishOnly: () => console.log(\`building \${P.basename(process.cwd())}\`),
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
            "dependencies": {
              "b": "^1.0.0"
            },
            "devDependencies": {
              "base-config-test": "^1.0.0"
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
            "baseConfig": "test",
            "devDependencies": {
              "base-config-test": "^1.0.0"
            }
          }

        `,
        'src/index.js': 'export default 1',
      },
    },
  })
  await ensureDir('node_modules')
  await symlink(P.resolve('packages/b'), P.join('node_modules', 'b'))
  await spawn('base', ['prepare'], { stdio: 'inherit' })
  const { stdout } = await spawn('base', ['prepublishOnly'], { capture: ['stdout'] })
  expect(stdout).toMatch('building a\n')
  expect(stdout).toMatch('building b\n')
})
