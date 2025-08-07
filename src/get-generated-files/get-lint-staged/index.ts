import type { Configuration as LintStagedConfig } from 'lint-staged';

import mergeConfigs from './merge-lint-staged-configs';
import type { Base } from '@/src';

const baseLintStagedConfig = {
  '*.{json,ts,vue}': 'eslint --fix --config eslint.lint-staged.config.ts',
};

export default function (this: Base): LintStagedConfig {
  return this.config.lintStagedConfig
    ? mergeConfigs(baseLintStagedConfig, this.config.lintStagedConfig)
    : baseLintStagedConfig;
}
