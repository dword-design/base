import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import outputFiles from 'output-files'
import fs from 'fs-extra'
import P from 'path'
import { endent } from '@dword-design/functions'

import { Base } from '@/src/index.js'

export default tester({
  'mark base as used dependency': {
    files: {
      'node_modules/@dword-design': {},
      'package.json': JSON.stringify({
        devDependencies: {
          '@dword-design/base': '^1.0.0',
        },
        scripts: {
          test: 'foo',
        },
      }),
    },
    'unused dependencies': {
      files: {
        'package.json': JSON.stringify({
          dependencies: {
            'change-case': '^1.0.0',
            foo: '^1.0.0',
          },
        }),
        'src/index.js': 'export default 1',
      },
      async test() {
        await expect(this.base.depcheck()).rejects.toThrow(endent`
          Unused dependencies
          * change-case
          * foo
        `)
      },
    },
    async test() {
      await fs.symlink(
        P.join('..', '..', '..'),
        P.join('node_modules', '@dword-design', 'base')
      )
      await this.base.test()
    },
  },
  'prod dependency only in test': {
    files: {
      'node_modules/bar/index.js': 'module.exports = 1',
      'package.json': JSON.stringify({
        dependencies: {
          bar: '^1.0.0',
        },
      }),
      src: {
        'index.js': 'export default 1',
        'index.spec.js': endent`
      import bar from 'bar'

      export default bar
    `,
      },
    },
    async test() {
      await expect(this.base.test()).rejects.toThrow(endent`
        Unused dependencies
        * bar
      `)
    },
  },
  'invalid file': {
    files: {
      foo: '',
      'package.json': JSON.stringify({
        dependencies: {
          'change-case': '^1.0.0',
        },
      }),
    },
    config: {
      depcheckConfig: {
        specials: [
          path => {
            if (path === P.resolve('foo')) {
              throw new Error('foo')
            }
          },
        ],
      },
    },
    test() {
      expect(this.base.depcheck).rejects.toThrow(endent`
        Unused dependencies
        * change-case

        Invalid files
        * ${P.resolve('foo')}: Error: foo
      `)
    }
  },
  'depcheck ignoreMatches': {
    config: {
      depcheckConfig: {
        ignoreMatches: ['foo'],
      },
    },
    files: {
      'package.json': JSON.stringify({
        dependencies: {
          foo: '^1.0.0',
        },
      }),
    },
  },
  'base config in prod dependencies': {
    config: { name: 'foo' },
    files: {
      'node_modules/base-config-foo/index.js': 'module.exports = {}',
      'package.json': JSON.stringify({
        dependencies: {
          'base-config-foo': '^1.0.0',
        },
      }),
    },
    'base config in dev dependencies': {
      config: { name: 'foo' },
      files: {
        'node_modules/base-config-foo/index.js': 'module.exports = {}',
        'package.json': JSON.stringify({
          devDependencies: {
            'base-config-foo': '^1.0.0',
          },
        }),
      },
    },
    test() {
      return expect(this.base.depcheck()).rejects.toThrow(endent`
        Unused dependencies
        * base-config-foo
      `)
    },
  },
}, [
  testerPluginTmpDir(),
  {
    transform: test =>
      async function () {
        test = {
          config: {},
          files: {},
          ...test,
        }
        await outputFiles(test.files)
        this.base = new Base(test.config)
        test.test = test.test || (() => this.base.depcheck())
        await this.base.prepare()
        await test.test.call(this)
      },
  },
])