import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import fs from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'

import { Base } from '@/src/index.js'

export default tester(
  {
    'base config in prod dependencies': {
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
      config: { name: 'foo' },
      files: {
        'node_modules/base-config-foo/index.js': 'module.exports = {}',
        'package.json': JSON.stringify({
          dependencies: {
            'base-config-foo': '^1.0.0',
          },
        }),
      },
      test() {
        return expect(this.base.depcheck()).rejects.toThrow(endent`
          Unused dependencies
          * base-config-foo
        `)
      },
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
    'invalid file': {
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
      files: {
        foo: '',
        'package.json': JSON.stringify({
          dependencies: {
            'change-case': '^1.0.0',
          },
        }),
      },
      test() {
        expect(this.base.depcheck).rejects.toThrow(endent`
          Unused dependencies
          * change-case

          Invalid files
          * ${P.resolve('foo')}: Error: foo
        `)
      },
    },
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
          type: 'module',
        }),
      },
      async test() {
        await fs.symlink(
          P.join('..', '..', '..'),
          P.join('node_modules', '@dword-design', 'base'),
        )
        await this.base.test()
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
  },
  [
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
  ],
)
