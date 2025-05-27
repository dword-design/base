import config from '@dword-design/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['eslint.config.js']),
  config,
  {
    files: ['eslint.config.js'],
    rules: { 'import/no-extraneous-dependencies': 'off' },
  },
]);
