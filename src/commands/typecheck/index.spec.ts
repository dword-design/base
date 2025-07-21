import { expect, test } from '@playwright/test';
import endent from 'endent';
import outputFiles from 'output-files';

import { Base } from '@/src';

test('type error: ts', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'src/index.ts': endent`
      const foo = (x: string) => console.log(x);
      foo(5);
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.typecheck({ stderr: 'pipe' })).rejects.toThrow(
    "src/index.ts(2,5): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.",
  );
});

test('type error: vue', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'package.json': JSON.stringify({ name: 'foo' }),
    'src/index.vue': endent`
      <template>
        <div />
      </template>

      <script setup lang="ts">
      const foo = (x: string) => console.log(x);
      foo(5);
      </script>
    `,
  });

  const base = new Base(null, { cwd });
  await base.prepare();

  await expect(base.typecheck({ stderr: 'pipe' })).rejects.toThrow(
    "src/index.vue(7,5): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.",
  );
});

test('custom typecheck', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  const base = new Base(
    {
      typecheck: () => {
        throw new Error('foobar');
      },
    },
    { cwd },
  );

  await base.prepare();
  await expect(base.typecheck()).rejects.toThrow('foobar');
});
