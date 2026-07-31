import type { Base } from '@/src';

import mergeConfigs from './merge-lint-staged-configs';

const baseLintStagedConfig = {
  '*.{json,ts,vue}': 'eslint --fix --config eslint.lint-staged.config.ts',
};

export default (base: Base) =>
  base.config.lintStagedConfig
    ? mergeConfigs(baseLintStagedConfig, base.config.lintStagedConfig)
    : baseLintStagedConfig;
