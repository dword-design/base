import dedent from 'dedent';
import packageName from 'depcheck-package-name';

export default function () {
  return (
    this.config.eslintConfig ||
    dedent`
      ${
        this.packageConfig.name === '@dword-design/eslint-config'
          ? dedent`
            import { defineConfig, globalIgnores } from '${packageName`eslint`}/config';

            import config from './src/index.js';
          `
          : dedent`
            import config from '${packageName`@dword-design/eslint-config`}';
            import { defineConfig, globalIgnores } from '${packageName`eslint`}/config';
          `
      }

      export default defineConfig([
        globalIgnores(['eslint.config.js']),
        config,
      ]);\n
    `
  );
}
