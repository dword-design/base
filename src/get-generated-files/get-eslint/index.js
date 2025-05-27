import { endent } from '@dword-design/functions';
import packageName from 'depcheck-package-name';

export default function () {
  return (
    this.config.eslintConfig ||
    endent`
      ${
        this.packageConfig.name === '@dword-design/eslint-config'
          ? endent`
            import { defineConfig, globalIgnores } from '${packageName`eslint`}/config';

            import config from './src/index.js';
          `
          : endent`
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
