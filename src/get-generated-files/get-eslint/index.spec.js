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
      import config from '@dword-design/eslint-config';
      import { defineConfig, globalIgnores } from 'eslint/config';

      export default defineConfig([
        globalIgnores(['eslint.config.js']),
        config,
      ]);\n
    `);
  },
};
