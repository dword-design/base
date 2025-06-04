import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import dedent from 'dedent';
import packageName from 'depcheck-package-name';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import outputFiles from 'output-files';
import stripAnsi from 'strip-ansi';

import { Base } from '@/src';

const javascript = dedent;

test('assertion', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    src: {
      'index.spec.ts': javascript`
        import { test, expect } from '@playwright/test';

        test('valid', () => expect(1).toEqual(2));
      `,
      'index.ts': 'export default 1',
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'Error: expect(received).toEqual(expected)',
  );
});

test('bin: object', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: { foo: './dist/cli.js' } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('bin: object: outside dist', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: { foo: './src/cli.js' } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/bin/foo must match pattern "^\\.\\/dist\\/"',
  );
});

test('bin: string', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: './dist/cli.js' }),
  );

  const base = await new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('bin: string: outside dist', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ bin: './src/cli.js' }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/bin must match pattern "^\\.\\/dist\\/"',
  );
});

test('config file errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '_foo' }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow('package.json invalid');
});

test('empty', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('image snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.spec.ts': javascript`
      import { test, expect } from '@playwright/test';

      import sharp from '${packageName`sharp`}'

      test('works', async () => {
        const img = await sharp({
          create: {
            background: { b: 0, g: 255, r: 0 },
            channels: 3,
            height: 48,
            width: 48,
          },
        })
          .png()
          .toBuffer()
        expect(img).toMatchSnapshot()
      });
    `,
    'package.json': JSON.stringify({ devDependencies: { sharp: '^1.0.0' } }),
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();

  expect(
    await globby('*', { cwd: pathLib.join(cwd, 'index.spec.ts-snapshots') }),
  ).toEqual(['works-1.png']);
});

test('invalid name', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ name: '_foo' }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/name must match pattern "^(@[a-z0-9-~][a-z0-9-._~]*\\/)?[a-z0-9-~][a-z0-9-._~]*$"',
  );
});

test('json errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'test.json'), 'foo bar');
  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    "Parsing error: Unexpected identifier 'foo'",
  );
});

test('linting errors', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), "var foo = 'bar'");
  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test({ stderr: 'pipe' })).rejects.toThrow(
    "error  'foo' is assigned a value but never used  no-unused-vars",
  );
});

test('minimal', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();
  await fs.outputFile(pathLib.join(cwd, 'src', 'index.ts'), 'export default 1');
  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('multiple snapshots', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.spec.ts': javascript`
      import { test, expect } from '@playwright/test';

      test('works', () => {
        expect('foo').toMatchSnapshot()
        expect('bar').toMatchSnapshot()
      });\n
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();

  expect(
    await fs.readFile(
      pathLib.join(cwd, 'index.spec.ts-snapshots', 'works-1.txt'),
      'utf8',
    ),
  ).toEqual('foo');

  expect(
    await fs.readFile(
      pathLib.join(cwd, 'index.spec.ts-snapshots', 'works-2.txt'),
      'utf8',
    ),
  ).toEqual('bar');
});

test('node_modules postfix casing error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'node_modules-foo.ts': 'export default 1',
    'src/index.spec.ts': "import '@/node_modules-foo.ts'",
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow('Filename is not in kebab case.');
});

test('package overrides', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ pnpm: { overrides: { bulma: '^1' } } }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('error', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    'src/index.spec.ts': javascript`
      import { test, expect } from '${packageName`@playwright/test`}';

      test('valid', () => expect(1).toEqual(2));\n
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await expect(base.test()).rejects.toThrow();

  expect(
    await fs.exists(
      pathLib.join(cwd, 'test-results', 'src-index-valid', 'trace.zip'),
    ),
  ).toBe(true);
});

test('grep', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.spec.ts': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('test1', () => {});\n
        test('test2', () => {});\n
      `,
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ grep: 'test1' });
  expect(stdout).toMatch(`${pathLib.join('src', 'index.spec.ts')}:2:1 › test1`);
  expect(stdout).toMatch('1 passed');
});

test('pattern', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.spec.ts': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
      'index2.spec.ts': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ patterns: ['src/index.spec.ts'] });
  expect(stdout).toMatch(`${pathLib.join('src', 'index.spec.ts')}:2:1 › valid`);
  expect(stdout).toMatch('1 passed');
});

test('multiple patterns', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.spec.ts': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
      'index2.spec.ts': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
      'index3.spec.ts': javascript`
        import { test } from '${packageName`@playwright/test`}';

        test('valid', () => {});\n
      `,
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test({ patterns: ['src/index.spec.ts'] });
  expect(stdout).toMatch(`${pathLib.join('src', 'index.spec.ts')}:2:1 › valid`);

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index2.spec.ts')}:2:1 › valid`,
  );

  expect(stdout).toMatch('2 passed');
});

test('update snapshots', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    'playwright.config.ts': dedent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        expect: {
          toMatchSnapshot: {
            pathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
          },
        },
      });
    `,
    src: {
      'index.spec.ts': javascript`
        import { test, expect } from '${packageName`@playwright/test`}';

        test('valid', () => expect('foo').toMatchSnapshot());\n
      `,
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test({ updateSnapshots: true });

  expect(
    await fs.readFile(
      pathLib.join(cwd, 'src', 'index.spec.ts-snapshots', 'valid-1.txt'),
      'utf8',
    ),
  ).toEqual('foo');
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    src: {
      'index.spec.ts': javascript`
        import { test, expect } from '${packageName`@playwright/test`}';

        import foo from './index.ts'

        test('valid', () => expect(foo).toEqual(1));\n
      `,
      'index.ts': 'export default 1\n',
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  let { stdout } = await base.test();
  stdout = stripAnsi(stdout);

  expect(stdout).toMatch(
    `1 ${pathLib.join('src', 'index.spec.ts')}:3:1 › valid`,
  );

  expect(
    await fs.exists(
      pathLib.join(cwd, 'test-results', 'src-index-valid', 'trace.zip'),
    ),
  ).toBe(false);
});

test('snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'index.spec.ts'),
    javascript`
      import { test, expect } from '@playwright/test';

      test('works', () => expect('foo').toMatchSnapshot());\n
    `,
  );

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();

  expect(await globby('*', { cwd: pathLib.join(cwd) })).toEqual([
    'index.spec.ts-snapshots',
  ]);
});

test('in project root', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.spec.ts': javascript`
      import { test } from '@playwright/test';

      test('valid', () => console.log('run test'));\n
    `,
    'node_modules/base-config-foo/index.js': javascript`
      export default {
        allowedMatches: [
          'index.spec.ts',
        ],
      }
    `,
    'package.json': JSON.stringify({ baseConfig: 'foo' }),
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test();
  expect(stdout).toMatch('run test');
});

test('unused dependencies', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      dependencies: { 'change-case': '^1.0.0', foo: '^1.0.0' },
    }),
    'src/index.ts': 'export default 1',
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(dedent`
    Unused dependencies
    * change-case
    * foo
  `);
});

test('update snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    '__snapshots__/index.spec.ts.snap': javascript`
      exports[\`index works 1\`] = \`"foo"\`;
  
    `,
    'index.spec.ts': dedent`
      export default {
        works: function () {
          expect('bar').toMatchSnapshot(this)
        },
      }
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test({ updateSnapshots: true });
});

test('usesdocker macOS', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'cli.js': dedent`
      import { Base } from '../../dist/index.js';

      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const base = new Base();
      await base.prepare();
      await base.test();
    `,
    'src/index.spec.ts': dedent`
      import { test } from '@playwright/test';

      test('valid @usesdocker', () => { throw new Error('foobarbaz') });
    `,
  });

  await execaCommand('node cli.js', { cwd, env: { CI: true } });
});

test('usesdocker outside ci', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'cli.js': dedent`
      import { Base } from '../../dist/index.js';

      delete process.env.CI;
      delete process.env.GITHUB_ACTIONS;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const base = new Base();
      await base.prepare();
      await base.test();
    `,
    'src/index.spec.ts': dedent`
      import { test } from '@playwright/test';

      test('valid @usesdocker', () => { throw new Error('foobarbaz') });
    `,
  });

  await expect(execaCommand('node cli.js', { cwd })).rejects.toThrow(
    'foobarbaz',
  );
});

test('usesdocker windows', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'cli.js': dedent`
      import { Base } from '../../dist/index.js';

      Object.defineProperty(process, 'platform', { value: 'win32' });

      const base = new Base();
      await base.prepare();
      await base.test();
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'src/index.spec.ts': dedent`
      import { test, expect } from '@playwright/test';

      test('valid @usesdocker', () => expect(1).toEqual(2));
    `,
  });

  await execaCommand('node cli.js', { cwd, env: { CI: true } });
});

test('wrong dependencies type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ dependencies: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/dependencies must be object',
  );
});

test('wrong description type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ description: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/description must be string',
  );
});

test('wrong dev dependencies type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ devDependencies: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/devDependencies must be object',
  );
});

test('wrong keywords type', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await fs.outputFile(
    pathLib.join(cwd, 'package.json'),
    JSON.stringify({ keywords: 1 }),
  );

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'package.json invalid\ndata/keywords must be array',
  );
});
