import { endent } from '@dword-design/functions';

import { Base } from '@/src/index.js';

export default {
  'custom config': () => {
    const base = new Base({ eslintConfig: 'foo' });
    expect(base.getEslintConfig()).toEqual('foo');
  },
  valid: () => {
    const base = new Base();

    expect(base.getEslintConfig()).toEqual(endent`
      import { defineConfig } from 'eslint/config';

      import config from '@dword-design/eslint-config';

      export default defineConfig([
        config,
        {
          files: ['eslint.config.js'],
          rules: { 'import/no-extraneous-dependencies': 'off' },
        },
      ]);\n
    `);
  },
};
