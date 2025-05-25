import { endent } from '@dword-design/functions';
import packageName from 'depcheck-package-name';

export default function () {
  return (
    this.config.eslintConfig ||
    endent`
      import { defineConfig } from '${packageName`eslint`}/config';
      import config from '${packageName`@dword-design/eslint-config`}';

      export default defineConfig([
        config,
        {
          files: ['eslint.config.js'],
          rules: {
            'import/no-extraneous-dependencies': 'off',
          },
        },
      ]);\n
    `
  );
}
