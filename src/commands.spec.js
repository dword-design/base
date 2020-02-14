import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import P from 'path'
import { symlink, ensureDir } from 'fs-extra'

export default {
  valid: () => withLocalTmpDir(async () => {
    await outputFiles({
      'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          commands: {
            prepublishOnly: () => console.log('foo'),
          },
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
      'src/index.js': 'export default 1',
    })
    const { stdout } = await spawn('base', ['prepublishOnly'], { capture: ['stdout'] })
    expect(stdout).toEqual('foo\n')
  }),
  'workspaces with dependencies': () => withLocalTmpDir(async () => {
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
  }),
  'workspaces with errors': () => withLocalTmpDir(async () => {
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
  }),
}