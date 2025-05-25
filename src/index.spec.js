import P from 'node:path';

import chdir from '@dword-design/chdir';
import { endent, identity, keys, omit, sortBy } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import { Base as Self } from './index.js';

export default tester(
  {
    'array merge': async () => {
      await fs.outputFile(
        P.join('node_modules', '@dword-design', 'base-config-foo', 'index.js'),
        "module.exports = { allowedMatches: ['foo.txt'] }",
      );

      const base = new Self({
        allowedMatches: ['bar.txt'],
        name: '@dword-design/foo',
      });

      expect(base.config.allowedMatches).toEqual(['foo.txt', 'bar.txt']);
    },
    'call multiple times': async () => {
      await fs.outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        'module.exports = {}',
      );

      const config = { name: 'foo' };
      let self = new Self(config);
      self = new Self(config);
      expect(self.config.name).toEqual('base-config-foo');
    },
    'do not recurse up to find package.json': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ description: 'foo' }),
      );

      await fs.ensureDir('sub');

      await chdir('sub', () => {
        expect(new Self().packageConfig.description).toBeUndefined();
      });
    },
    empty: () =>
      expect(new Self().config.name).toEqual('@dword-design/base-config-node'),
    async 'empty parent'() {
      await outputFiles({
        'node_modules/base-config-foo/index.js': 'module.exports = {}',
        'package.json': JSON.stringify({ name: 'foo' }),
      });

      const base = new Self({ name: 'foo' });

      expect(
        base.config |> omit(['depcheckConfig', 'prepare', 'lint']),
      ).toMatchSnapshot(this);

      expect(typeof base.config.depcheckConfig).toEqual('object');
      expect(base.config.lint(1)).toEqual(1);
    },
    esm: async () => {
      await fs.outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        'export default {}',
      );

      expect(new Self({ name: 'foo' }).config.name).toEqual('base-config-foo');
    },
    function: () => {
      const base = new Self(() => ({ readmeInstallString: 'foo' }));
      expect(base.config.readmeInstallString).toEqual('foo');
    },
    'function inherited': async () => {
      await fs.outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        'module.exports = config => ({ readmeInstallString: config.bar })',
      );

      const base = new Self({ bar: 'baz', name: 'foo' });
      expect(base.config.readmeInstallString).toEqual('baz');
    },
    global: async () => {
      await fs.outputFile('package.json', JSON.stringify({ name: 'foo' }));
      const base = new Self({ global: true });

      expect(base.config.readmeInstallString).toEqual(endent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install -g foo

        # Yarn
        $ yarn global add foo
        \`\`\`
      `);
    },
    async inherited() {
      await fs.outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        endent`
          module.exports = {
            commands: {
              prepublishOnly: x => x + 1,
              start: x => x + 3,
            },
            deployAssets: [{ label: 'Foo', path: 'foo.js' }],
            deployEnv: {
              FOO: '\${{ secrets.FOO }}',
            },
            deployPlugins: ['semantic-release-foo'],
            editorIgnore: ['foo'],
            gitignore: ['foo'],
            lint: x => x + 3,
            nodeVersion: 10,
            packageBaseConfig: {
              main: 'dist/index.scss',
            },
            preDeploySteps: [{ run: 'foo' }],
            prepare: x => x + 2,
            readmeInstallString: 'foo',
            supportedNodeVersions: [1, 2],
          }

        `,
      );

      const base = new Self({ name: 'foo' });

      expect(
        base.config |> omit(['commands', 'depcheckConfig', 'prepare', 'lint']),
      ).toMatchSnapshot(this);

      expect(base.config.commands |> keys |> sortBy(identity)).toEqual([
        'prepublishOnly',
        'start',
      ]);

      expect(base.run('prepublishOnly', 1)).toEqual(2);
      expect(base.run('start', 1)).toEqual(4);
      expect(base.config.prepare(1)).toEqual(3);
      expect(base.config.lint(1)).toEqual(4);
      expect(typeof base.config.depcheckConfig).toEqual('object');
    },
    'name scoped': async () => {
      await fs.outputFile(
        P.join('node_modules', '@dword-design', 'base-config-foo', 'index.js'),
        'module.exports = {}',
      );

      expect(new Self({ name: '@dword-design/foo' }).config.name).toEqual(
        '@dword-design/base-config-foo',
      );
    },
    'name shortcut': async () => {
      await fs.outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        'module.exports = {}',
      );

      expect(new Self({ name: 'foo' }).config.name).toEqual('base-config-foo');
    },
    run: async () => {
      await fs.outputFile(
        P.join('node_modules', 'base-config-foo', 'index.js'),
        'module.exports = {}',
      );

      expect(
        new Self({
          commands: {
            foo() {
              return this.config.foo;
            },
          },
          foo: 'bar',
        }).run('foo'),
      ).toEqual('bar');
    },
  },
  [testerPluginTmpDir()],
);
