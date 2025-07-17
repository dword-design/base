import packageName from 'depcheck-package-name';
import { mapValues, pick, stubTrue } from 'lodash-es';
import sortKeys from 'sort-keys';

export default function () {
  const commandNames = {
    checkUnknownFiles: true,
    commit: true,
    depcheck: true,
    lint: true,
    prepare: true,
    typecheck: true,
    verify: true,
    ...(this.config.testInContainer && { 'test:raw': true }),
    test: true,
    ...mapValues(this.config.commands, stubTrue),
  };

  return {
    ...pick(
      this.packageConfig,
      Object.keys({
        baseConfig: true,
        bin: true,
        dependencies: true,
        deploy: true,
        description: true,
        devDependencies: true,
        keywords: true,
        name: true,
        optionalDependencies: true,
        packageManager: true,
        peerDependencies: true,
        pnpm: true,
        private: true,
        publishConfig: true,
        resolutions: true,
      }),
    ),
    funding: 'https://github.com/sponsors/dword-design',
    publishConfig: { access: 'public' },
    type: 'module',
    version: this.packageConfig.version || '1.0.0',
    ...(this.config.git && {
      repository: `dword-design/${this.config.git.project}`,
    }),
    author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
    engines: {
      node: `>=${this.config.minNodeVersion || this.config.supportedNodeVersions[0]}`,
    },
    files: ['dist'],
    license: 'MIT',
    ...this.config.packageConfig,
    scripts: sortKeys(
      mapValues(commandNames, (handler, name) =>
        this.packageConfig.name === '@dword-design/base'
          ? `${packageName`tsx`} src/cli.ts ${name}`
          : `base ${name}`,
      ),
    ),
  };
}
