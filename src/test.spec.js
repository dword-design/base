import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import { outputFile } from 'fs-extra'
import { endent } from '@dword-design/functions'
import glob from 'glob-promise'

export default {
  assertion: () => withLocalTmpDir(async () => {
    await outputFiles({
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
          export default {
            valid: () => expect(1).toEqual(2),
          }
        `,
      },
    })
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout', 'stderr'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('Error: expect(received).toEqual(expected)')
  }),
  'bin outside dist': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "bin": {
          "foo": "./src/cli.js"
        }
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.bin[\'foo\'] should match pattern')
  }),
  'config file errors': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "name": "_foo"
      }
  
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('package.json invalid')
  }),
  empty: () => withLocalTmpDir(async () => {
    await spawn('base', ['prepare'])
    await spawn('base', ['test'])
  }),
  'invalid name': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "name": "_foo"
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.name should match pattern')
  }),
  'json errors': () => withLocalTmpDir(async () => {
    await outputFile('src/index.js', 'export default 1')
    await spawn('base', ['prepare'])
    await outputFile('src/test.json', endent`
      {
      "foo": "bar"
      }
    `)
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('Format Error: expected "  "')
  }),
  'linting errors': () => withLocalTmpDir(async () => {
    await outputFile('src/index.js', 'export default 1;')
  
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('error  Extra semicolon  semi')
  }),
  minimal: () => withLocalTmpDir(async () => {
    await outputFile('src/index.js', 'export default 1')
    await spawn('base', ['prepare'])
    await spawn('base', ['test'])
  }),
  'missing readme sections': () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- TITLE -->
  
      <!-- BADGES -->
  
      <!-- LICENSE -->
  
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toEqual('The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL\n')
  }),
  'parent package config': () => withLocalTmpDir(async () => {
    // relevant e.g. for base-config-node
    await outputFiles({
      inner: {
        'package.json': endent`
          {
            "baseConfig": "foo",
            "devDependencies": {
              "base-config-foo": "^1.0.0"
            }
          }
  
        `,
        'test/valid.test.js': endent`
          import foo from 'base-config-foo'
  
          export default () => expect(foo.prepublishOnly()).toEqual(1)
        `,
      },
      'package.json': endent`
        {
          "name": "base-config-foo",
          "main": "src/index.js"
        }
  
      `,
      'src/index.js': endent`
        export default {
          prepublishOnly: () => 1,
        }
      `,
    })
    process.chdir('inner')
    await spawn('base', ['prepare'])
    await spawn('base', ['test'])
  }),
  'parent package inside node modules': () => withLocalTmpDir(async () => {
    await outputFiles({
      node_modules: {
        'bar/index.js': 'module.exports = require(\'foo\')',
      },
      'package.json': endent`
        {
          "name": "foo",
          "devDependencies": {
            "bar": "^1.0.0"
          }
        }
  
      `,
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
          import bar from 'bar'
    
          export default {
            valid: () => {
              console.log('run valid in index')
              expect(bar).toEqual(1)
            },
          }
        `,
      },
    })
    await spawn('base', ['prepare'])
    const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
    expect(stdout).toMatch('run valid in index')
  }),
  'parent package require inside spawn': () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': endent`
        {
          "name": "foo",
          "devDependencies": {
            "child-process-promise": "^1.0.0",
            "fs-extra": "^1.0.0",
            "@dword-design/functions": "^1.0.0"
          }
        }
  
      `,
      src: {
        'index.js': 'export default \'foo bar\'',
        'index.spec.js': endent`
          import { outputFile, chmod } from 'fs-extra'
          import { spawn } from 'child-process-promise'
          import { endent } from '@dword-design/functions'
  
          export default {
            valid: async () => {
              await outputFile('cli.js', endent\`
                #!/usr/bin/env node
        
                import foo from 'foo'
        
                console.log(foo)
              \`)
              await chmod('cli.js', '755')
              await spawn('./cli.js', [], { stdio: 'inherit' })
            },
          }
        `,
      },
    })
    await spawn('base', ['prepare'])
    const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
    expect(stdout).toMatch('foo bar')
  }),
  pattern: () => withLocalTmpDir(async () => {
    await outputFiles({
      src: {
        'index.js': 'export default 1',
        'index1.spec.js': 'export default { valid: () => console.log(\'run index1\') }',
        'index2.spec.js': 'export default { valid: () => console.log(\'run index2\') }',
      },
    })
    await spawn('base', ['prepare'])
    const { stdout } = await spawn('base', ['test', 'src/index2.spec.js'], { capture: ['stdout'] })
    expect(stdout).not.toMatch('run index1')
    expect(stdout).toMatch('run index2')
  }),
  grep: () => withLocalTmpDir(async () => {
    await outputFiles({
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
          export default {
            bar: () => console.log('run bar'),
            foo: () => console.log('run foo'),
          }
        `,
      },
    })
    await spawn('base', ['prepare'])
    const { stdout } = await spawn('base', ['test', '--grep', 'foo'], { capture: ['stdout'] })
    expect(stdout).not.toMatch('run bar')
    expect(stdout).toMatch('run foo')
  }),
  'prod dependency only in test': () => withLocalTmpDir(async () => {
    await outputFiles({
      'node_modules/bar/index.js': 'export default 1',
      'package.json': endent`
        {
          "dependencies": {
            "bar": "^1.0.0"
          }
        }
  
      `,
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
          import bar from 'bar'
    
          export default bar
        `,
      },
    })
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch(endent`
      Unused dependencies
      * bar
    `)
  }),
  'unstable version': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "version": "0.1.0"
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.version should match pattern')
  }),
  'unused dependecy': () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': endent`
        {
          "dependencies": {
            "change-case": "^1.0.0"
          }
        }
  
      `,
      'src/index.js': 'export default 1',
    })
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch(endent`
      Unused dependencies
      * change-case
  
    `)
  }),
  valid: () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': endent`
        {
          "name": "foo"
        }
  
      `,
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
          import foo from 'foo'
    
          export default {
            valid: () => {
              expect(process.env.NODE_ENV).toEqual('test')
              expect(foo).toEqual(1)
              console.log('run test')
            },
          }
        `,
      },
    })
    await spawn('base', ['prepare'])
    const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
    expect(stdout).toMatch('run test')
    expect(await glob('*', { dot: true })).toEqual([
      '.cz.json',
      '.editorconfig',
      '.eslintrc.json',
      '.gitattributes',
      '.github',
      '.gitignore',
      '.gitpod.Dockerfile',
      '.gitpod.yml',
      '.nyc_output',
      '.releaserc.json',
      '.renovaterc.json',
      'coverage',
      'LICENSE.md',
      'node_modules',
      'package.json',
      'README.md',
      'src',
    ])
  }),
  workspaces: () => withLocalTmpDir(async () => {
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
          src: {
            'index.js': 'export default 1',
            'index.spec.js': endent`
              export default {
                valid: () => console.log('run foo'),
              }
            `,
          },
        },
        b: {
          'package.json': endent`
            {
              "name": "b"
            }
  
          `,
          src: {
            'index.js': 'export default 1',
            'index.spec.js': endent`
              export default {
                valid: () => console.log('run bar'),
              }
            `,
          },
        },
      },
    })
    await spawn('base', ['prepare'])
    const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
    expect(stdout).toMatch('run foo\n')
    expect(stdout).toMatch('run bar\n')
  }),
  'wrong dependencies type': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "dependencies": 1
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.dependencies should be object')
  }),
  'wrong description type': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "description": 1
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.description should be string')
  }),
  'wrong dev dependencies type': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "devDependencies": 1
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.devDependencies should be object')
  }),
  'wrong keywords type': () => withLocalTmpDir(async () => {
    await outputFile('package.json', endent`
      {
        "keywords": 1
      }
    `)
    await spawn('base', ['prepare'])
    let stdout
    try {
      await spawn('base', ['test'], { capture: ['stdout'] })
    } catch (error) {
      stdout = error.stdout
    }
    expect(stdout).toMatch('data.keywords should be array')
  }),  
}