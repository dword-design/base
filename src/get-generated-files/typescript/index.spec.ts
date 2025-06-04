import pathLib from 'node:path';

import { expect, test } from '@playwright/test';
import dedent from 'dedent';
import { execaCommand } from 'execa';
import fs from 'fs-extra';
import outputFiles from 'output-files';

import self from '.';

test('alias', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    src: { 'foo.ts': '', 'index.ts': "import '@/src/foo';" },
    'tsconfig.json': JSON.stringify(self),
  });

  await execaCommand('tsc --outDir dist', { cwd });
  await execaCommand('tsc-alias --outDir dist --resolve-full-paths', { cwd });

  expect(
    await fs.readFile(pathLib.join(cwd, 'dist', 'index.js'), 'utf8'),
  ).toEqual("import './foo.js';\n");
});

test('valid', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'src/index.ts': dedent`
      const foo: string = 'bar';

      export default foo;\n
    `,
    'tsconfig.json': JSON.stringify(self),
  });

  await execaCommand('tsc --outDir dist', { cwd });

  expect(await fs.readFile(pathLib.join(cwd, 'dist', 'index.js'), 'utf8'))
    .toEqual(dedent`
      const foo = 'bar';
      export default foo;\n
    `);
});
