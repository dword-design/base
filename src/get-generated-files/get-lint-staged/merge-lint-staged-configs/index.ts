import braces from 'braces';
import type { Configuration } from 'lint-staged';
import sortKeys from 'sort-keys';

// Helper function to create brace pattern from expanded globs
const createBracePattern = (expandedGlobs: string[]): string | null => {
  if (expandedGlobs.length <= 1) return null;
  // Sort to ensure consistent output
  const sortedGlobs = expandedGlobs.toSorted();

  // Check if all globs follow the same pattern (prefix.extension)
  const globParts = sortedGlobs.map(glob => {
    const lastDotIndex = glob.lastIndexOf('.');
    if (lastDotIndex === -1) return null;
    return {
      extension: glob.slice(Math.max(0, lastDotIndex + 1)),
      prefix: glob.slice(0, Math.max(0, lastDotIndex)),
    };
  });

  // Ensure all parts are valid and have the same prefix
  if (globParts.includes(null)) return null;
  const prefix = globParts[0]!.prefix;
  if (!globParts.every(part => part!.prefix === prefix)) return null;
  // Extract extensions and create brace pattern
  const extensions = globParts.map(part => part!.extension);
  return `${prefix}.{${extensions.join(',')}}`;
};

/**
 * Safely merges two lint-staged configs by expanding overlapping globs
 * and merging commands for each normalized glob pattern.
 * Avoids race conditions by combining commands per unique glob.
 */
const mergeConfigs = (
  configA: Configuration,
  configB: Configuration,
): Configuration => {
  const expandedMap = new Map<string, Set<string>>();
  const originalToExpanded = new Map<string, string[]>();
  const expandedToOriginals = new Map<string, Set<string>>();

  // Collect all original globs and their expansions
  for (const config of [configA, configB]) {
    for (const [glob, cmds] of Object.entries(config)) {
      const commands = Array.isArray(cmds) ? cmds : [cmds];
      const expandedGlobs = braces.expand(glob);
      originalToExpanded.set(glob, expandedGlobs);

      for (const expandedGlob of expandedGlobs) {
        if (!expandedToOriginals.has(expandedGlob)) {
          expandedToOriginals.set(expandedGlob, new Set());
        }

        expandedToOriginals.get(expandedGlob)!.add(glob);

        if (!expandedMap.has(expandedGlob)) {
          expandedMap.set(expandedGlob, new Set());
        }

        for (const cmd of commands) {
          expandedMap.get(expandedGlob)!.add(cmd);
        }
      }
    }
  }

  const result: Configuration = {};
  const processedExpanded = new Set<string>();
  // Try to reconstruct brace patterns for non-overlapping cases
  const originalGlobs = [...originalToExpanded.keys()];

  for (const originalGlob of originalGlobs) {
    const expandedGlobs = originalToExpanded.get(originalGlob)!;

    // Check if we can create a reduced brace pattern
    const unprocessedExpanded = expandedGlobs.filter(
      eg => !processedExpanded.has(eg),
    );

    if (unprocessedExpanded.length > 1) {
      // Find which expanded globs have the same commands
      const firstExpanded = unprocessedExpanded[0];
      const firstCommands = expandedMap.get(firstExpanded)!;

      const sameCommandsExpanded = unprocessedExpanded.filter(eg => {
        const commands = expandedMap.get(eg)!;
        return (
          commands.size === firstCommands.size &&
          [...firstCommands].every(cmd => commands.has(cmd))
        );
      });

      if (sameCommandsExpanded.length > 1) {
        // Create brace pattern from the matching expanded globs
        const pattern = createBracePattern(sameCommandsExpanded);

        if (pattern) {
          const commandsArray = [...firstCommands];

          result[pattern] =
            commandsArray.length === 1 ? commandsArray[0] : commandsArray;

          for (const eg of sameCommandsExpanded) processedExpanded.add(eg);
        }
      }
    }
  }

  // Add remaining expanded globs that couldn't be grouped
  for (const [expandedGlob, commands] of expandedMap) {
    if (!processedExpanded.has(expandedGlob)) {
      const commandsArray = [...commands];

      result[expandedGlob] =
        commandsArray.length === 1 ? commandsArray[0] : commandsArray;
    }
  }

  return sortKeys(result);
};

export default mergeConfigs;
