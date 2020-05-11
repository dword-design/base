import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import execa from 'execa'
import { outputFile, chmod } from 'fs-extra'
import { endent } from '@dword-design/functions'
import glob from 'glob-promise'
import portReady from 'port-ready'
import kill from 'tree-kill-promise'

export default {
  assertion: () =>
    withLocalTmpDir(async () => {
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
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], {
          all: true,
        })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('Error: expect(received).toEqual(expected)')
    }),
  'bin outside dist': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "bin": {
          "foo": "./src/cli.js"
        }
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch("data.bin['foo'] should match pattern")
    }),
  'config file errors': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "name": "_foo"
      }
  
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('package.json invalid')
    }),
  empty: () =>
    withLocalTmpDir(async () => {
      await execa(require.resolve('./cli'), ['prepare'])
      await execa(require.resolve('./cli'), ['test'])
    }),
  'invalid name': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "name": "_foo"
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('data.name should match pattern')
    }),
  'json errors': () =>
    withLocalTmpDir(async () => {
      await outputFile('src/test.json', 'foo bar')
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('error  Unexpected token o')
    }),
  'linting errors': () =>
    withLocalTmpDir(async () => {
      await outputFile('src/index.js', "var foo = 'bar'")

      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch(
        "error  'foo' is assigned a value but never used  no-unused-vars"
      )
    }),
  minimal: () =>
    withLocalTmpDir(async () => {
      await outputFile('src/index.js', 'export default 1')
      await execa(require.resolve('./cli'), ['prepare'])
      await execa(require.resolve('./cli'), ['test'])
    }),
  'missing readme sections': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'README.md',
        endent`
      <!-- TITLE -->
  
      <!-- BADGES -->
  
      <!-- LICENSE -->
  
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toEqual(
        'The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL'
      )
    }),
  pattern: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        src: {
          'index.js': 'export default 1',
          'index1.spec.js':
            "export default { valid: () => console.log('run index1') }",
          'index2.spec.js':
            "export default { valid: () => console.log('run index2') }",
        },
      })
      await execa(require.resolve('./cli'), ['prepare'])
      const { all } = await execa(
        require.resolve('./cli'),
        ['test', 'src/index2.spec.js'],
        { all: true }
      )
      expect(all).not.toMatch('run index1')
      expect(all).toMatch('run index2')
    }),
  grep: () =>
    withLocalTmpDir(async () => {
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
      await execa(require.resolve('./cli'), ['prepare'])
      const { all } = await execa(
        require.resolve('./cli'),
        ['test', '--grep', 'foo'],
        { all: true }
      )
      expect(all).not.toMatch('run bar')
      expect(all).toMatch('run foo')
    }),
  'prod dependency only in test': () =>
    withLocalTmpDir(async () => {
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
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch(endent`
      Unused dependencies
      * bar
    `)
    }),
  'unstable version': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "version": "0.1.0"
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('data.version should match pattern')
    }),
  'unused dependecy': () =>
    withLocalTmpDir(async () => {
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
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch(endent`
      Unused dependencies
      * change-case
    `)
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': endent`
        {
          "name": "foo"
        }
  
      `,
        src: {
          'index.js': 'export default 1',
          'index.spec.js': endent`
          import foo from '.'
    
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
      await execa(require.resolve('./cli'), ['prepare'])
      const { all } = await execa(require.resolve('./cli'), ['test'], {
        all: true,
      })
      expect(all).toMatch('run test')
      expect(await glob('*', { dot: true })).toEqual([
        '.babelrc.json',
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
  'wrong dependencies type': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "dependencies": 1
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('data.dependencies should be object')
    }),
  'wrong description type': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "description": 1
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('data.description should be string')
    }),
  'wrong dev dependencies type': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "devDependencies": 1
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('data.devDependencies should be object')
    }),
  'wrong keywords type': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        endent`
      {
        "keywords": 1
      }
    `
      )
      await execa(require.resolve('./cli'), ['prepare'])
      let all
      try {
        await execa(require.resolve('./cli'), ['test'], { all: true })
      } catch (error) {
        all = error.all
      }
      expect(all).toMatch('data.keywords should be array')
    }),
  'kill server': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'cli.js',
        endent`
      #!/usr/bin/env node

      import http from 'http'

      http.createServer().listen(3000)
    `
      )
      await chmod('cli.js', '755')
      const childProcess = execa.command('./cli.js')
      await portReady(3000)
      await kill(childProcess.pid)
    }),
}
