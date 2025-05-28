import P from 'node:path';

import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import outputFiles from 'output-files';

import { Base } from '@/src/index.js';

export default tester(
  {
    'base config in dev dependencies': {
      config: { name: 'foo' },
      files: {
        'node_modules/base-config-foo/index.js': 'export default {}',
        'package.json': JSON.stringify({
          devDependencies: { 'base-config-foo': '^1.0.0' },
        }),
      },
    },
    'base config in prod dependencies': {
      config: { name: 'foo' },
      files: {
        'node_modules/base-config-foo/index.js': 'export default {}',
        'package.json': JSON.stringify({
          dependencies: { 'base-config-foo': '^1.0.0' },
        }),
      },
      test() {
        return expect(this.base.depcheck()).rejects.toThrow(endent`
          Unused dependencies
          * base-config-foo
        `);
      },
    },
    'depcheck ignoreMatches': {
      config: { depcheckConfig: { ignoreMatches: ['foo'] } },
      files: {
        'package.json': JSON.stringify({ dependencies: { foo: '^1.0.0' } }),
      },
    },
    'eslint config > dev dependency': {
      files: {
        'package.json': JSON.stringify({ devDependencies: { eslint: '*' } }),
        'src/index.js': 'export default 1',
      },
      async test() {
        await expect(this.base.depcheck()).rejects.toThrow(endent`
          Unused devDependencies
          * eslint
        `);
      },
    },
    'eslint config > prod dependency': {
      files: {
        'package.json': JSON.stringify({ dependencies: { eslint: '*' } }),
        'src/index.js': 'export default 1',
      },
      async test() {
        await expect(this.base.depcheck()).rejects.toThrow(endent`
          Unused dependencies
          * eslint
        `);
      },
    },
    'invalid file': {
      config: {
        depcheckConfig: {
          specials: [
            path => {
              if (path === P.resolve('foo')) {
                throw new Error('foo');
              }
            },
          ],
        },
      },
      files: {
        foo: '',
        'package.json': JSON.stringify({
          dependencies: { 'change-case': '^1.0.0' },
        }),
      },
      test() {
        expect(this.base.depcheck).rejects.toThrow(endent`
          Unused dependencies
          * change-case

          Invalid files
          * ${P.resolve('foo')}: Error: foo
        `);
      },
    },
    'prod dependency only in global-test-hooks.js': {
      files: {
        'global-test-hooks.js': "import 'bar'",
        'node_modules/bar/index.js': 'export default 1',
        'package.json': JSON.stringify({
          dependencies: { bar: '^1.0.0' },
          type: 'module',
        }),
      },
      async test() {
        await expect(this.base.test()).rejects.toThrow(endent`
          Unused dependencies
          * bar
        `);
      },
    },
    'prod dependency only in test': {
      files: {
        'node_modules/bar/index.js': 'export default 1',
        'package.json': JSON.stringify({ dependencies: { bar: '^1.0.0' } }),
        'src/index.spec.js': "import 'bar'",
      },
      async test() {
        await expect(this.base.test()).rejects.toThrow(endent`
          Unused dependencies
          * bar
        `);
      },
    },
    'unused dependencies': {
      files: {
        'package.json': JSON.stringify({
          dependencies: { 'change-case': '^1.0.0', foo: '^1.0.0' },
        }),
        'src/index.js': 'export default 1',
      },
      async test() {
        await expect(this.base.depcheck()).rejects.toThrow(endent`
          Unused dependencies
          * change-case
          * foo
        `);
      },
    },
  },
  [
    testerPluginTmpDir(),
    {
      transform: test =>
        async function () {
          test = { config: {}, files: {}, ...test };
          await outputFiles(test.files);
          this.base = new Base(test.config);
          test.test = test.test || (() => this.base.depcheck());
          await this.base.prepare();
          await test.test.call(this);
        },
    },
  ],
);
