import packageName from 'depcheck-package-name';
import endent from 'endent';

export default function () {
  return (
    this.config.eslintConfig ||
    endent`
      ${
        this.packageConfig.name === '@dword-design/eslint-config'
          ? endent`
            import { defineConfig, globalIgnores } from '${packageName`eslint`}/config';

            import config from './src';
          `
          : endent`
            import config from '${packageName`@dword-design/eslint-config`}';
            import { defineConfig, globalIgnores } from '${packageName`eslint`}/config';
          `
      }

      export default defineConfig([
        globalIgnores(['eslint.config.ts', 'eslint.lint-staged.config.ts']),
        config,
      ]);\n
    `
  );
}
