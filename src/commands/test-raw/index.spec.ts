import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import packageName from 'depcheck-package-name';
import endent from 'endent';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import { globby } from 'globby';
import nodeVersionLib from 'node-version';
import outputFiles from 'output-files';
import stripAnsi from 'strip-ansi';

import { Base } from '@/src';

const javascript = endent;

const isSameOrAfter24_12_0 =
  Number(nodeVersionLib.major) >= 24 && Number(nodeVersionLib.minor) >= 12;

test('assertion', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    src: {
      'index.spec.ts': javascript`
        import { test, expect } from '@playwright/test';

        test('valid', () => expect(1).toEqual(2));
      `,
      'index.ts': 'export default 1;',
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.test()).rejects.toThrow(
    'Error: expect(received).toEqual(expected)',
  );
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
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*', sharp: '*' },
    }),
    'playwright.config.ts': endent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        snapshotPathTemplate:
          '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
      });
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test({ updateSnapshots: true });

  expect(
    await globby('*', { cwd: pathLib.join(cwd, 'index.spec.ts-snapshots') }),
  ).toEqual(['works-1.png']);
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
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'playwright.config.ts': endent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        snapshotPathTemplate:
          '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
      });
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test({ updateSnapshots: true });

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

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index.spec.ts')}:${isSameOrAfter24_12_0 ? 2 : 3}:1 › test1`,
  );

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

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index.spec.ts')}:${isSameOrAfter24_12_0 ? 2 : 3}:1 › valid`,
  );

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

  const { stdout } = await base.test({
    patterns: ['src/index.spec.ts', 'src/index2.spec.ts'],
  });

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index.spec.ts')}:${isSameOrAfter24_12_0 ? 2 : 3}:1 › valid`,
  );

  expect(stdout).toMatch(
    `${pathLib.join('src', 'index2.spec.ts')}:${isSameOrAfter24_12_0 ? 2 : 3}:1 › valid`,
  );

  expect(stdout).toMatch('2 passed');
});

test('existing snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    'playwright.config.ts': endent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        snapshotPathTemplate:
          '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
      });
    `,
    src: {
      'index.spec.ts': javascript`
        import { test, expect } from '${packageName`@playwright/test`}';

        test('valid', () => expect('foo').toMatchSnapshot());\n
      `,
      'index.spec.ts-snapshots/valid-1.txt': 'foo',
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test();
});

test('update existing snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
      name: 'foo',
    }),
    'playwright.config.ts': endent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        snapshotPathTemplate:
          '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
      });
    `,
    src: {
      'index.spec.ts': javascript`
        import { test, expect } from '${packageName`@playwright/test`}';

        test('valid', () => expect('foo').toMatchSnapshot());\n
      `,
      'index.spec.ts-snapshots/valid-1.txt': 'foo',
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

  await fs.outputFile(
    pathLib.join(cwd, 'src', 'index.spec.ts'),
    javascript`
      import { test, expect } from '${packageName`@playwright/test`}';

      test('valid', () => expect('bar').toMatchSnapshot());\n
    `,
  );

  await base.test({ updateSnapshots: true });

  expect(
    await fs.readFile(
      pathLib.join(cwd, 'src', 'index.spec.ts-snapshots', 'valid-1.txt'),
      'utf8',
    ),
  ).toEqual('bar');
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

        import foo from '.';

        test('valid', () => expect(foo).toEqual(1));\n
      `,
      'index.ts': 'export default 1\n',
    },
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  let { stdout } = await base.test();
  stdout = typeof stdout === 'string' ? stdout : stdout.toString();
  stdout = stripAnsi(stdout);

  expect(stdout).toMatch(
    `1 ${pathLib.join('src', 'index.spec.ts')}:${isSameOrAfter24_12_0 ? 3 : 5}:1 › valid`,
  );

  expect(
    await fs.exists(
      pathLib.join(cwd, 'test-results', 'src-index-valid', 'trace.zip'),
    ),
  ).toBe(false);
});

test('snapshot', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'index.spec.ts': javascript`
      import { test, expect } from '@playwright/test';

      test('works', () => expect('foo').toMatchSnapshot());\n
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'playwright.config.ts': endent`
      import { defineConfig } from '@playwright/test';

      export default defineConfig({
        snapshotPathTemplate:
          '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
      });
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await base.test({ updateSnapshots: true });

  expect(
    await fs.readFile(
      pathLib.join(cwd, 'index.spec.ts-snapshots/works-1.txt'),
      'utf8',
    ),
  ).toEqual('foo');
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
    'package.json': JSON.stringify({
      baseConfig: 'foo',
      devDependencies: { '@playwright/test': '*' },
    }),
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  const { stdout } = await base.test();
  expect(stdout).toMatch('run test');
});

test('usesdocker macOS', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'cli.ts': endent`
      import { Base } from '../../src';

      Object.defineProperty(process, 'platform', { value: 'darwin' });
      await new Base().test();
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'src/index.spec.ts': endent`
      import { test } from '@playwright/test';

      test('valid @usesdocker', () => { throw new Error('foobarbaz') });
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await fs.remove(pathLib.join(cwd, 'tsconfig.json'));
  await execaCommand('tsx cli.ts', { cwd, env: { CI: String(true) } });
});

test('usesdocker outside ci', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'cli.ts': endent`
      import { Base } from '../../src';

      delete process.env.CI;
      delete process.env.GITHUB_ACTIONS;
      Object.defineProperty(process, 'platform', { value: 'darwin' });
      await new Base().test();
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'src/index.spec.ts': endent`
      import { test } from '@playwright/test';

      test('valid @usesdocker', () => { throw new Error('foobarbaz') });
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await fs.remove(pathLib.join(cwd, 'tsconfig.json'));

  await expect(execaCommand('tsx cli.ts', { cwd })).rejects.toThrow(
    'foobarbaz',
  );
});

test('usesdocker windows', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'cli.ts': endent`
      import { Base } from '../../src';

      Object.defineProperty(process, 'platform', { value: 'win32' });
      await new Base().test();
    `,
    'package.json': JSON.stringify({
      devDependencies: { '@playwright/test': '*' },
    }),
    'src/index.spec.ts': endent`
      import { test, expect } from '@playwright/test';

      test('valid @usesdocker', () => expect(1).toEqual(2));
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();
  await fs.remove(pathLib.join(cwd, 'tsconfig.json'));
  await execaCommand('tsx cli.ts', { cwd, env: { CI: String(true) } });
});
