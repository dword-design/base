import braces from 'braces';
import type { Configuration } from 'lint-staged';

type LintStagedConfig = Record<string, string | string[]>;

/**
 * Safely merges two lint-staged configs by expanding overlapping globs
 * and merging commands for each normalized glob pattern.
 * Avoids race conditions by combining commands per unique glob.
 */
const mergeConfigs = (
  configA: Configuration,
  configB: Configuration,
): Configuration => {
  const mergedMap = new Map<string, Set<string>>();

  for (const config of [configA, configB]) {
    for (const [glob, cmds] of Object.entries(config)) {
      const commands = Array.isArray(cmds) ? cmds : [cmds];
      const expandedGlobs = braces.expand(glob);

      for (const g of expandedGlobs) {
        if (!mergedMap.has(g)) mergedMap.set(g, new Set());

        for (const cmd of commands) {
          mergedMap.get(g)!.add(cmd);
        }
      }
    }
  }

  // Convert the map to an object
  const result: LintStagedConfig = {};

  for (const [glob, cmds] of mergedMap.entries()) {
    result[glob] = [...cmds];
  }

  return result;
};

export default mergeConfigs;
