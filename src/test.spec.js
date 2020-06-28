import { endent, identity, sortBy } from '@dword-design/functions'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

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
        'package.json': JSON.stringify(
          {
            dependencies: {
              foo: '^1.0.0',
            },
          },
          undefined,
          2
        ),
        'README.md': '',
      })
      await execa(require.resolve('./cli'), ['prepare'])
      const output = await execa(
        require.resolve('./cli'),
        ['test', 'src/index2.spec.js'],
        { all: true }
      )
      expect(output.all).not.toMatch('run index1')
      expect(output.all).toMatch('run index2')
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
      const output = await execa(
        require.resolve('./cli'),
        ['test', '--grep', 'foo'],
        { all: true }
      )
      expect(output.all).not.toMatch('run bar')
      expect(output.all).toMatch('run foo')
    }),
  'prod dependency only in test': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/bar/index.js': 'export default 1',
        'package.json': JSON.stringify(
          {
            dependencies: {
              bar: '^1.0.0',
            },
          },
          undefined,
          2
        ),
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
        'package.json': JSON.stringify(
          {
            dependencies: {
              'change-case': '^1.0.0',
            },
          },
          undefined,
          2
        ),
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
        'package.json': JSON.stringify(
          {
            name: 'foo',
          },
          undefined,
          2
        ),
        src: {
          'index.js': endent`
            export default 1
            
          `,
          'index.spec.js': endent`
          import foo from '.'
    
          export default {
            valid: () => {
              expect(foo).toEqual(1)
              console.log('run test')
            },
          }
          
        `,
        },
      })
      await execa(require.resolve('./cli'), ['prepare'])
      const output = await execa(require.resolve('./cli'), ['test'], {
        all: true,
      })
      expect(output.all).toMatch('run test')
      expect(
        globby('*', { onlyFiles: false, dot: true })
          |> await |> sortBy(identity)
      ).toEqual([
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
        '.vscode',
        'LICENSE.md',
        'README.md',
        'coverage',
        'node_modules',
        'package.json',
        'src',
      ])
    }),
  'test in project root': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
          module.exports = {
            allowedMatches: [
              'index.spec.js',
            ],
          }
        `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
        'index.spec.js': endent`
          export default {
            valid: () => console.log('run test')
          }

        `,
      })
      await execa(require.resolve('./cli'), ['prepare'])
      const output = await execa(require.resolve('./cli'), ['test'], {
        all: true,
      })
      expect(output.all).toMatch('run test')
    }),
  'wrong dependencies type': () =>
    withLocalTmpDir(async () => {
      await outputFile(
        'package.json',
        JSON.stringify(
          {
            dependencies: 1,
          },
          undefined,
          2
        )
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
}
