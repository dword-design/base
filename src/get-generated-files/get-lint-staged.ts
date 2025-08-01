import type { Configuration as LintStagedConfig } from 'lint-staged';

export default function (): LintStagedConfig {
  return {
    '*.{json,ts,vue}': 'eslint --fix --config eslint.lint-staged.config.ts',
    ...this.config.lintStaged,
  };
}
