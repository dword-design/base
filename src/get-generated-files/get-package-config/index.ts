import packageName from 'depcheck-package-name';
import { mapValues, pick, stubTrue } from 'lodash-es';
import sortKeys from 'sort-keys';
import pathLib from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = pathLib.dirname(fileURLToPath(import.meta.url));
const isInNodeModules = __dirname.split(pathLib.sep).includes('node_modules');
const resolver = createRequire(import.meta.url);

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
        isInNodeModules
          ? `base ${name}`
          : `${packageName`tsx`} ${pathLib
            .relative(
              this.cwd,
              resolver.resolve('../../cli.ts'),
            )
            .split(pathLib.sep)
            .join('/')} ${name}`
      ),
    ),
  };
}
