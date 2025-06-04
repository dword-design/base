import { expect, test } from '@playwright/test';
import dedent from 'dedent';

import { Base } from '@/src';

test('custom config', () => {
  const base = new Base({ eslintConfig: 'foo' });
  expect(base.getEslintConfig()).toEqual('foo');
});

test('valid', () => {
  const base = new Base();

  expect(base.getEslintConfig()).toEqual(dedent`
    import config from '@dword-design/eslint-config';
    import { defineConfig, globalIgnores } from 'eslint/config';

    export default defineConfig([
      globalIgnores(['eslint.config.js']),
      config,
    ]);\n
  `);
});
