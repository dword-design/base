import { endent } from '@dword-design/functions';
import tester from '@dword-design/tester';
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import P from 'path';

import { Base } from '@/src/index.js';

export default tester(
  {
    'custom linter': async () => {
      const base = new Base({
        lint: () => {
          throw new Error('foobar');
        },
      });

      await base.prepare();
      await expect(base.lint()).rejects.toThrow('foobar');
    },
    fixable: async () => {
      await fs.outputFile('src/index.js', "console.log('foo')");
      const base = new Base();
      await base.prepare();
      await base.lint();

      expect(await fs.readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        endent`
          console.log('foo');

        `,
      );
    },
    'linting errors': async () => {
      await fs.outputFile('src/index.js', "const foo = 'bar'");
      const base = new Base();
      await base.prepare();

      await expect(base.lint()).rejects.toThrow(
        "'foo' is assigned a value but never used",
      );
    },
    'package name != repository name': async () => {
      await fs.outputFile(
        'package.json',
        JSON.stringify({ name: '@scope/bar' }),
      );

      await execaCommand('git init');

      await execaCommand(
        'git remote add origin https://github.com/xyz/foo.git',
      );

      const base = new Base();
      await base.prepare();

      await expect(base.lint()).rejects.toThrow(
        "Package name 'bar' has to be equal to repository name 'foo'",
      );
    },
    'package name with dot': async () => {
      await fs.outputFile('package.json', JSON.stringify({ name: 'foo.de' }));
      await execaCommand('git init');

      await execaCommand(
        'git remote add origin https://github.com/xyz/foo.de.git',
      );

      const base = new Base();
      await base.prepare();
      await base.lint();
    },
  },
  [testerPluginTmpDir()],
);
