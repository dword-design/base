import pathLib from 'node:path';

import { createDefu } from '@dword-design/defu';
import type { Options as DepcheckOptions } from 'depcheck';
import depcheck from 'depcheck';
import depcheckDetectorBinName from 'depcheck-detector-bin-name';
import depcheckDetectorExeca from 'depcheck-detector-execa';
import depcheckDetectorPackageName from 'depcheck-detector-package-name';
import packageName from 'depcheck-package-name';
import endent from 'endent';
import fs from 'fs-extra';
import type GitHost from 'hosted-git-info';
import { createJiti } from 'jiti';
import type { Configuration as LintStagedConfig } from 'lint-staged';
import { identity, mapValues } from 'lodash-es';
import type { PartialCommandObjectInObject } from 'make-cli';
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name';
import type { RenovateConfig } from 'renovate/dist/config/types';
import type { ArrayTail, PackageJson, TsConfigJson, Simplify } from 'type-fest';

import type { PartialCommandOptions } from './commands/command-options-input';
import getDepcheckSpecialBase from './get-depcheck-special-base';
import getGeneratedFiles from './get-generated-files';
import getPackageConfig from './get-generated-files/get-package-config';
import getGitInfo from './get-git-info';

type InterfaceToType<T> = Simplify<T>;

type PackageJsonStandard = InterfaceToType<PackageJson.PackageJsonStandard>;

/* eslint-disable @typescript-eslint/no-explicit-any */
type HandlerWithBase<TConfig extends Config = Config> = (
  base: Base<TConfig>,
  ...arguments_: any[]
) => any;
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
type PartialCommandObjectInObjectWithBase<TConfig extends Config = Config> =
  Omit<PartialCommandObjectInObject, 'handler'> & {
    handler: (base: Base<TConfig>, ...arguments_: any[]) => any;
  };
/* eslint-enable @typescript-eslint/no-explicit-any */

type PartialCommandInObjectWithBase<TConfig extends Config = Config> =
  PartialCommandObjectInObjectWithBase<TConfig> | HandlerWithBase<TConfig>;

type Config = {
  allowedMatches: string[];
  codecovGraphToken: string | null;
  commands: Record<string, PartialCommandObjectInObjectWithBase>;
  depcheckConfig: Omit<DepcheckOptions, 'package'>;
  deployAssets: Array<{ label: string; path: string }>;
  deployEnv: Record<string, string>;
  deployPlugins: string[];
  doppler: boolean;
  editorIgnore: string[];
  eslintConfig: string;
  fetchGitHistory: boolean;
  git?: GitHost;
  githubActionsTypecheckMemoryLimitMb: number | null;
  gitignore: string[];
  global: boolean;
  hasTypescriptConfigRootAlias: boolean;
  isLockFileFixCommitType: boolean;
  lint: <TConfig extends Config>(
    base: Base<TConfig>,
    options?: PartialCommandOptions,
  ) => unknown;
  lintStagedConfig: LintStagedConfig;
  macos: boolean;
  maxNodeVersion: number | null;
  minNodeVersion: number | null;
  name?: string;
  nodeVersion: number;
  npmPublish: boolean;
  packageConfig: PackageJsonStandard;
  preDeploySteps: string[];
  prepare: <TConfig extends Config>(
    base: Base<TConfig>,
    options?: PartialCommandOptions,
  ) => unknown;
  readmeInstallString: string;
  renovateConfig: RenovateConfig;
  seeAlso: Array<{ description: string; repository: string }>;
  supportedNodeVersions: number[];
  syncKeywords: boolean;
  testInContainer: boolean;
  typecheck: <TConfig extends Config>(
    base: Base<TConfig>,
    options?: PartialCommandOptions,
  ) => unknown;
  typescriptConfig: TsConfigJson;
  windows: boolean;
};

type PartialConfigObject<TConfig extends Config = Config> = Omit<
  Partial<TConfig>,
  'commands'
> & { commands?: Record<string, PartialCommandInObjectWithBase<TConfig>> };

type PartialConfigOrFunction<TConfig extends Config = Config> =
  | PartialConfigObject<TConfig>
  | ((
      base: Base<TConfig>,
      config?: PartialConfigObject<TConfig>,
    ) => PartialConfigObject<TConfig>);

type PartialConfig<TConfig extends Config = Config> =
  PartialConfigOrFunction<TConfig> | string | null;

export const defineBaseConfig = <T>(configInput: T): T => configInput;

const mergeConfigs = createDefu((object, key, value) => {
  if (key === 'supportedNodeVersions') {
    object[key] = value;
    return true;
  }

  return false;
});

const run = <
  TConfig extends Config,
  K extends keyof TConfig['commands'] & string,
>(
  base: Base<TConfig>,
  name: K,
  ...arguments_: ArrayTail<Parameters<TConfig['commands'][K]['handler']>>
): ReturnType<TConfig['commands'][K]['handler']> =>
  base.config.commands[name].handler.call(base, base, ...arguments_); // TODO: Remove "call" and "this" after removing "this" is deployed

class Base<TConfig extends Config = Config> {
  config: TConfig;
  packageConfigFromFile: PackageJson;
  packageConfig: ReturnType<typeof getPackageConfig<TConfig>>;
  cwd: string;
  generatedFiles: ReturnType<typeof getGeneratedFiles>;

  constructor(configInput: PartialConfig<TConfig> = null, { cwd = '.' } = {}) {
    this.cwd = cwd;
    const jitiInstance = createJiti(pathLib.resolve(this.cwd));

    const config = (() => {
      if (configInput === null) {
        return {
          name: packageName`@dword-design/base-config-node`,
        } as PartialConfigObject<TConfig>;
      }

      if (typeof configInput === 'string') {
        return { name: configInput } as PartialConfigObject<TConfig>;
      }

      if (typeof configInput === 'function') {
        return configInput(this);
      }

      return configInput;
    })();

    if (config.name) {
      config.name = pluginNameToPackageName(config.name, 'base-config');
    }

    this.packageConfigFromFile = fs.existsSync(
      pathLib.join(this.cwd, 'package.json'),
    )
      ? fs.readJsonSync(pathLib.join(this.cwd, 'package.json'))
      : {};

    const isGlobal = config.global ?? false;

    const defaultConfig = {
      allowedMatches: [],
      codecovGraphToken: null,
      commands: {},
      depcheckConfig: {
        detectors: [
          depcheck.detector.exportDeclaration,
          depcheck.detector.importDeclaration,
          depcheck.detector.requireCallExpression,
          depcheck.detector.requireResolveCallExpression,
          depcheckDetectorExeca({ cwd: this.cwd }),
          depcheckDetectorPackageName,
          depcheckDetectorBinName({ cwd: this.cwd }),
        ],
        ignorePath: '.gitignore',
        parsers: { '**/*.ts': depcheck.parser.typescript },
        specials: [getDepcheckSpecialBase(config.name), depcheck.special.bin],
      },
      deployAssets: [],
      deployEnv: {},
      deployPlugins: [],
      doppler: false,
      editorIgnore: [],
      eslintConfig: '',
      fetchGitHistory: false,
      git: getGitInfo({ cwd: this.cwd }),
      githubActionsTypecheckMemoryLimitMb: null,
      gitignore: [],
      global: false,
      hasTypescriptConfigRootAlias: true,
      isLockFileFixCommitType: false,
      lint: () => {},
      lintStagedConfig: {},
      macos: false, // TODO: Too expensive in GitHub Actions, and what are the use cases?
      maxNodeVersion: null,
      minNodeVersion: null,
      nodeVersion: 22,
      npmPublish: false,
      packageConfig: {},
      preDeploySteps: [],
      prepare: identity,
      readmeInstallString: endent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install ${isGlobal ? '-g ' : ''}${this.packageConfigFromFile.name}

        # Yarn
        $ yarn ${isGlobal ? 'global ' : ''}add ${this.packageConfigFromFile.name}
        \`\`\`
      `,
      renovateConfig: {},
      seeAlso: [],
      supportedNodeVersions: [22],
      syncKeywords: true,
      testInContainer: false,
      typecheck: () => {},
      typescriptConfig: {},
      windows: true,
    };

    const inheritedConfigPath =
      config.name && config.name === this.packageConfigFromFile.name
        ? pathLib.resolve(this.cwd, 'src', 'index.ts')
        : config.name;

    let inheritedConfig:
      | PartialConfigOrFunction<TConfig>
      | { default: PartialConfigOrFunction<TConfig> } = inheritedConfigPath
      ? jitiInstance(inheritedConfigPath)
      : undefined;

    if (inheritedConfig && 'default' in inheritedConfig) {
      inheritedConfig = inheritedConfig.default;
    }

    if (typeof inheritedConfig === 'function') {
      inheritedConfig = inheritedConfig.call(
        this,
        this,
        mergeConfigs(defaultConfig, config) as unknown as TConfig, // TODO: mergeConfigs returns a conditional type here although it's clear that this is a full config
      ); // TODO: Remove "call" and "this" after removing "this" is deployed
    }

    this.config = mergeConfigs(
      config,
      inheritedConfig,
      defaultConfig,
    ) as unknown as TConfig; // TODO: mergeConfigs returns a conditional type here although it's clear that this is a full config

    this.config = {
      ...this.config,
      commands: mapValues(this.config.commands, command =>
        typeof command === 'function' ? { handler: command } : command,
      ),
    };

    this.packageConfig = getPackageConfig(this);
    this.generatedFiles = getGeneratedFiles(this);
  }
}

export { default as loadConfig } from './load-config';

export { default as loadConfigSync } from './load-config-sync';

export { Base };

export type { Config, PartialConfig };

export { type PartialCommandOptions } from './commands/command-options-input';

export { default as checkUnknownFiles } from './commands/check-unknown-files';

export { default as depcheck } from './commands/depcheck';

export { default as commit } from './commands/commit';

export { default as getEslintConfig } from './get-generated-files/get-eslint';

export { default as getEditorIgnoreConfig } from './get-generated-files/get-editor-ignore';

export { default as getGithubSyncMetadataConfig } from './get-generated-files/get-github-sync-metadata';

export { default as getGeneratedFiles } from './get-generated-files';

export { default as getGitignoreConfig } from './get-generated-files/get-gitignore';

export { default as getGithubWorkflowConfig } from './get-generated-files/get-github-workflow';

export { default as getGitpodDockerfile } from './get-generated-files/get-gitpod-dockerfile';

export { default as getGitpodConfig } from './get-generated-files/get-gitpod';

export { default as getLintStaged } from './get-generated-files/get-lint-staged';

export { default as getLicenseString } from './get-generated-files/get-license-string';

export { default as getReadmeString } from './get-generated-files/get-readme-string';

export { default as getPackageConfig } from './get-generated-files/get-package-config';

export { default as getRenovateConfig } from './get-generated-files/get-renovate';

export { default as getReleaseConfig } from './get-generated-files/get-release';

export { default as getVscodeConfig } from './get-generated-files/get-vscode';

export { default as getTypescriptConfig } from './get-generated-files/get-typescript';

export { default as lintPackagejson } from './commands/lint/lint-packagejson';

export { default as lint } from './commands/lint';

export { default as test } from './commands/test';

export { default as prepare } from './commands/prepare';

export { default as testRaw } from './commands/test-raw';

export { default as testDocker } from './commands/test-docker';

export { default as verify } from './commands/verify';

export { default as typecheck } from './commands/typecheck';

export { run };
