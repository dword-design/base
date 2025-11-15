import packageName from 'depcheck-package-name';
import endent from 'endent';

export default endent`
  import { defineConfig } from '${packageName`eslint`}/config';
  import parent from './eslint.config';

  export default defineConfig([
    ...parent,
    {
      files: ['**/*.spec.ts'],
      rules: { 'playwright/no-focused-test': 'error' },
    },
  ]);\n
`;
