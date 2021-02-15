import {
  endent,
  identity,
  keyBy,
  mapValues,
  noop,
  property,
  stubTrue,
} from '@dword-design/functions'
import globby from 'globby'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from '.'

const runTest = config => {
  config = { files: {}, options: {}, test: noop, ...config }
  return () =>
    withLocalTmpDir(async () => {
      await outputFiles(config.files)
      const prepare = stealthyRequire(require.cache, () =>
        require('../prepare')
      )
      await prepare()
      let output
      try {
        output =
          self(config.pattern, { log: false, ...config.options })
          |> await
          |> property('all')
      } catch (error) {
        output = error.message
      }
      await config.test(output)
    })
}

export default {
  assertion: {
    files: {
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
        export default {
          valid: () => expect(1).toEqual(2),
        }
      `,
      },
    },
    test: output =>
      expect(output).toMatch('Error: expect(received).toEqual(expected)'),
  },
  'bin outside dist': {
    files: {
      'package.json': JSON.stringify(
        { bin: { foo: './src/cli.js' } },
        undefined,
        2
      ),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/bin/foo should match pattern "^\\.\\/dist\\/"'
      ),
  },
  'config file errors': {
    files: {
      'package.json': JSON.stringify({ name: '_foo' }, undefined, 2),
    },
    test: output => expect(output).toMatch('package.json invalid'),
  },
  empty: {},
  grep: {
    files: {
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
        export default {
          bar: () => console.log('run bar'),
          foo: () => console.log('run foo'),
        }
      `,
      },
    },
    options: { grep: 'foo' },
    test: output => {
      expect(output).not.toMatch('run bar')
      expect(output).toMatch('run foo')
    },
  },
  'invalid name': {
    files: {
      'package.json': JSON.stringify({ name: '_foo' }, undefined, 2),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/name should match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"'
      ),
  },
  'json errors': {
    files: {
      'src/test.json': 'foo bar',
    },
    test: output => expect(output).toMatch('error  Unexpected token o'),
  },
  'linting errors': {
    files: {
      'src/index.js': "var foo = 'bar'",
    },
    test: output =>
      expect(output).toMatch(
        "error  'foo' is assigned a value but never used  no-unused-vars"
      ),
  },
  minimal: {
    files: {
      'src/index.js': 'export default 1',
    },
  },
  'missing readme sections': {
    files: {
      'README.md': endent`
        <!-- TITLE -->

        <!-- BADGES -->

        <!-- LICENSE -->

      `,
    },
    test: output =>
      expect(output).toEqual(
        'The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL'
      ),
  },
  pattern: {
    files: {
      'README.md': '',
      'package.json': JSON.stringify(
        {
          dependencies: {
            foo: '^1.0.0',
          },
        },
        undefined,
        2
      ),
      src: {
        'index.js': 'export default 1',
        'index1.spec.js':
          "export default { valid: () => console.log('run index1') }",
        'index2.spec.js':
          "export default { valid: () => console.log('run index2') }",
      },
    },
    pattern: 'src/index2.spec.js',
    test: output => {
      expect(output).not.toMatch('run index1')
      expect(output).toMatch('run index2')
    },
  },
  'prod dependency only in test': {
    files: {
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
    },
    test: output =>
      expect(output).toMatch(endent`
      Unused dependencies
      * bar
    `),
  },
  'test in project root': {
    files: {
      'index.spec.js': endent`
        export default {
          valid: () => console.log('run test')
        }

      `,
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
    },
    test: output => expect(output).toMatch('run test'),
  },
  'unstable version': {
    files: {
      'package.json': JSON.stringify({ version: '0.1.0' }, undefined, 2),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/version should match pattern "^[1-9]\\d*\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$"'
      ),
  },
  'unused dependecy': {
    files: {
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
    },
    test: output =>
      expect(output).toMatch(endent`
      Unused dependencies
      * change-case
    `),
  },
  valid: {
    files: {
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
              expect(process.env.NODE_ENV).toEqual('test')
              expect(foo).toEqual(1)
              console.log('run test')
            },
          }

        `,
      },
    },
    test: async output => {
      expect(output).toMatch('run test')
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toEqual({
        '.babelrc.json': true,
        '.commitlintrc.json': true,
        '.cz.json': true,
        '.editorconfig': true,
        '.eslintrc.json': true,
        '.gitattributes': true,
        '.github': true,
        '.gitignore': true,
        '.gitpod.Dockerfile': true,
        '.gitpod.yml': true,
        '.huskyrc.json': true,
        '.nyc_output': true,
        '.releaserc.json': true,
        '.renovaterc.json': true,
        '.vscode': true,
        'LICENSE.md': true,
        'README.md': true,
        coverage: true,
        node_modules: true,
        'package.json': true,
        src: true,
      })
    },
  },
  'wrong dependencies type': {
    files: {
      'package.json': JSON.stringify(
        {
          dependencies: 1,
        },
        undefined,
        2
      ),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/dependencies should be object'
      ),
  },
  'wrong description type': {
    files: {
      'package.json': JSON.stringify(
        {
          description: 1,
        },
        undefined,
        2
      ),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/description should be string'
      ),
  },
  'wrong dev dependencies type': {
    files: {
      'package.json': JSON.stringify({ devDependencies: 1 }, undefined, 2),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/devDependencies should be object'
      ),
  },
  'wrong keywords type': {
    files: {
      'package.json': JSON.stringify({ keywords: 1 }, undefined, 2),
    },
    test: output =>
      expect(output).toMatch(
        'package.json invalid\ndata/keywords should be array'
      ),
  },
} |> mapValues(runTest)
