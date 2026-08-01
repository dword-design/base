import defaults from '@dword-design/defaults';
import packageName from 'depcheck-package-name';
import { mapValues, pick, stubTrue } from 'lodash-es';
import sortKeys from 'sort-keys';

import type { Base, Config } from '@/src';
import typedKeys from '@/src/lib/typed-keys';

export default <TConfig extends Config>(base: Base<TConfig>) => {
  const commandNames = {
    checkUnknownFiles: true,
    commit: true,
    depcheck: true,
    lint: true,
    prepare: true,
    test: true,
    typecheck: true,
    ...(base.config.testInContainer && { 'test:raw': true }),
    verify: true,
    ...mapValues(base.config.commands, stubTrue),
  };

  return defaults(base.config.packageConfig, {
    ...pick(
      base.packageConfigFromFile,
      typedKeys({
        baseConfig: true,
        bin: true,
        dependencies: true,
        description: true,
        devDependencies: true,
        keywords: true,
        name: true,
        optionalDependencies: true,
        packageManager: true,
        peerDependencies: true,
        peerDependenciesMeta: true,
        pnpm: true,
        private: true,
        publishConfig: true,
      }),
    ),
    author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
    engines: {
      node: `>=${base.config.minNodeVersion ?? base.config.supportedNodeVersions[0]}${base.config.maxNodeVersion === null ? '' : `<${base.config.maxNodeVersion}`}`,
    },
    files: ['dist'],
    funding: 'https://github.com/sponsors/dword-design',
    ...(base.config.git && {
      repository: `dword-design/${base.config.git.project}`,
    }),
    license: 'MIT' as const,
    publishConfig: { access: 'public' as const },
    scripts: sortKeys(
      mapValues(commandNames, (handler, name) =>
        base.packageConfigFromFile.name === '@dword-design/base'
          ? `${packageName`tsx`} src/cli.ts ${name}`
          : `base ${name}`,
      ),
    ),
    type: 'module' as const,
    version: base.packageConfigFromFile.version || '1.0.0',
  });
};
