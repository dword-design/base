import { expect, test } from '@playwright/test';
import endent from 'endent';

import { Base } from '@/src';

import self from '.';

test('custom config', () => {
  const base = new Base({ eslintConfig: 'foo' });
  expect(self(base)).toEqual('foo');
});

test('valid', () => {
  const base = new Base();

  expect(self(base)).toEqual(endent`
    import config from '@dword-design/eslint-config';
    import { defineConfig, globalIgnores } from 'eslint/config';

    export default defineConfig([
      globalIgnores(['eslint.config.ts', 'eslint.lint-staged.config.ts']),
      config,
    ]);\n
  `);
});
