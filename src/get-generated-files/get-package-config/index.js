import pathLib from 'node:path';

import { keys, mapValues, pick, stubTrue } from '@dword-design/functions';
import packageName from 'depcheck-package-name';
import fs from 'fs-extra';
import sortKeys from 'sort-keys';

export default function () {
  const commandNames = {
    checkUnknownFiles: true,
    commit: true,
    depcheck: true,
    lint: true,
    prepare: true,
    ...(this.config.testInContainer && { 'test:raw': true }),
    test: true,
    ...(this.config.commands |> mapValues(stubTrue)),
  };

  return {
    type: 'module',
    ...(this.packageConfig
      |> pick(
        {
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
          type: true,
          types: true,
        } |> keys,
      )),
    funding: 'https://github.com/sponsors/dword-design',
    publishConfig: { access: 'public' },
    version: this.packageConfig.version || '1.0.0',
    ...(this.config.git && {
      repository: `dword-design/${this.config.git.project}`,
    }),
    author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
    engines: {
      node: `>=${this.config.minNodeVersion || this.config.supportedNodeVersions[0]}`,
    },
    files: [
      'dist',
      ...(fs.existsSync(pathLib.join(this.cwd, 'types.d.ts'))
        ? ['types.d.ts']
        : []),
    ],
    license: 'MIT',
    ...this.config.packageConfig,
    scripts:
      commandNames
      |> mapValues((handler, name) =>
        this.packageConfig.name === '@dword-design/base'
          ? `rimraf dist && babel --config-file ${packageName`@dword-design/babel-config`} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
          : `base ${name}`,
      )
      |> sortKeys,
  };
}
