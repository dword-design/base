import pathLib from 'node:path';

import { createDefu } from '@dword-design/defu';
import type { Options as DepcheckOptions } from 'depcheck';
import depcheck from 'depcheck';
import depcheckDetectorBinName from 'depcheck-detector-bin-name';
import depcheckDetectorExeca from 'depcheck-detector-execa';
import depcheckDetectorPackageName from 'depcheck-detector-package-name';
import packageName from 'depcheck-package-name';
import endent from 'endent';
import { type ResultPromise } from 'execa';
import fs from 'fs-extra';
import type GitHost from 'hosted-git-info';
import { createJiti } from 'jiti';
import type { Configuration as LintStagedConfig } from 'lint-staged';
import { identity, mapValues } from 'lodash-es';
import type { PartialCommandObjectInObject } from 'make-cli';
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name';
import type { RenovateConfig } from 'renovate/dist/config/types';
import type { PackageJson, TsConfigJson } from 'type-fest';

import checkUnknownFiles from './commands/check-unknown-files';
import type { PartialCommandOptions } from './commands/command-options-input';
import commit from './commands/commit';
import depcheckMethod from './commands/depcheck';
import lint from './commands/lint';
import lintPackagejson from './commands/lint/lint-packagejson';
import prepare from './commands/prepare';
import test from './commands/test';
import testDocker from './commands/test-docker';
import testRaw from './commands/test-raw';
import typecheck from './commands/typecheck';
import verify from './commands/verify';
import getDepcheckSpecialBase from './get-depcheck-special-base';
import getGeneratedFiles from './get-generated-files';
import getEditorIgnoreConfig from './get-generated-files/get-editor-ignore';
import getEslintConfig from './get-generated-files/get-eslint';
import getGithubSyncMetadataConfig from './get-generated-files/get-github-sync-metadata';
import getGithubWorkflowConfig from './get-generated-files/get-github-workflow';
import getGitignoreConfig from './get-generated-files/get-gitignore';
import getGitpodConfig from './get-generated-files/get-gitpod';
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile';
import getLicenseString from './get-generated-files/get-license-string';
import getLintStaged from './get-generated-files/get-lint-staged';
import getPackageConfig from './get-generated-files/get-package-config';
import getReadmeString from './get-generated-files/get-readme-string';
import getReleaseConfig from './get-generated-files/get-release';
import getRenovateConfig from './get-generated-files/get-renovate';
import getTypescriptConfig from './get-generated-files/get-typescript';
import getVscodeConfig from './get-generated-files/get-vscode';
import getGitInfo from './get-git-info';

// Base config interface that can be extended
interface BaseConfig {
  name?: string;
  global: boolean;
  allowedMatches: string[];
  commands: Record<string, CommandDefinition<readonly unknown[], BaseConfig>>; // Proper typing
  depcheckConfig: Omit<DepcheckOptions, 'package'>;
  deployAssets: Array<{ label: string; path: string }>;
  deployEnv: Record<string, string>;
  deployPlugins: string[];
  editorIgnore: string[];
  fetchGitHistory: boolean;
  git?: GitHost;
  gitignore: string[];
  hasTypescriptConfigRootAlias: boolean;
  lintStagedConfig: LintStagedConfig;
  lint: (options?: PartialCommandOptions) => unknown;
  typecheck: (options?: PartialCommandOptions) => unknown;
  macos: boolean;
  minNodeVersion: number;
  nodeVersion: number;
  preDeploySteps: string[];
  prepare: (options?: PartialCommandOptions) => unknown;
  readmeInstallString: string;
  seeAlso: Array<{ description: string; repository: string }>;
  supportedNodeVersions: number[];
  syncKeywords: boolean;
  typescriptConfig: TsConfigJson;
  windows: boolean;
  testInContainer: boolean;
  eslintConfig: string;
  useJobMatrix: boolean;
  packageConfig: PackageJson;
  renovateConfig: RenovateConfig;
  isLockFileFixCommitType: boolean;
  doppler: boolean;
}

// Generic command handler type with proper typing and config access
type CommandHandler<
  TParams extends readonly unknown[] = readonly unknown[],
  TConfig extends BaseConfig = BaseConfig
> = (this: Base<TConfig>, ...args: TParams) => unknown;

// Type for a command object with typed handler
type CommandObject<
  TParams extends readonly unknown[] = readonly unknown[],
  TConfig extends BaseConfig = BaseConfig
> = Omit<PartialCommandObjectInObject, 'handler'> & {
  handler: CommandHandler<TParams, TConfig>;
};

// Type for commands that can be either a handler function or a command object
type CommandDefinition<
  TParams extends readonly unknown[] = readonly unknown[],
  TConfig extends BaseConfig = BaseConfig
> =
  | CommandObject<TParams, TConfig>
  | CommandHandler<TParams, TConfig>;

// Type for the commands record with proper typing
type CommandsRecord<TConfig extends BaseConfig = BaseConfig> = Record<
  string, 
  CommandDefinition<readonly unknown[], TConfig>
>;

// Extract command names from a commands record
type CommandNames<T extends CommandsRecord<BaseConfig>> = keyof T;

// Extract handler parameters for a specific command
type CommandParams<
  T extends CommandsRecord<BaseConfig>,
  K extends CommandNames<T>
> = T[K] extends CommandDefinition<infer P, BaseConfig> ? P : never;

// Config type is now just an alias for extensible configs
type Config<TConfig extends BaseConfig = BaseConfig> = TConfig;

type PartialConfigObject<TConfig extends BaseConfig = BaseConfig> = Omit<
  Partial<TConfig>, 
  'commands'
> & { 
  commands?: CommandsRecord<TConfig>
};

type PartialConfigOrFunction<TConfig extends BaseConfig = BaseConfig> =
  | PartialConfigObject<TConfig>
  | ((this: Base<TConfig>, config: TConfig) => PartialConfigObject<TConfig>);

type PartialConfig<TConfig extends BaseConfig = BaseConfig> =
  | PartialConfigOrFunction<TConfig>
  | string
  | null;

export const defineBaseConfig = <TConfig extends BaseConfig>(
  configInput: PartialConfig<TConfig>
): PartialConfig<TConfig> => configInput;

const mergeConfigs = createDefu((obj, key, value) => {
  if (key === 'supportedNodeVersions') {
    obj[key] = value;
    return true;
  }

  return false;
});

class Base<TConfig extends BaseConfig = BaseConfig> {
  config: TConfig;
  packageConfig: PackageJson;
  cwd: string;
  generatedFiles;

  commit(...args): ResultPromise {
    return commit.call(this, ...args);
  }

  lint(...args): ResultPromise {
    return lint.call(this, ...args);
  }

  lintPackagejson(...args): void {
    return lintPackagejson.call(this, ...args);
  }

  typecheck(...args): ResultPromise {
    return typecheck.call(this, ...args);
  }

  verify(...args): ResultPromise {
    return verify.call(this, ...args);
  }

  prepare(...args): void {
    return prepare.call(this, ...args);
  }

  test(...args): ResultPromise {
    return test.call(this, ...args);
  }

  testRaw(...args): ResultPromise {
    return testRaw.call(this, ...args);
  }

  testDocker(...args): ResultPromise {
    return testDocker.call(this, ...args);
  }

  getPackageConfig(...args) {
    return getPackageConfig.call(this, ...args);
  }

  getGeneratedFiles(...args) {
    return getGeneratedFiles.call(this, ...args);
  }

  checkUnknownFiles(...args): void {
    return checkUnknownFiles.call(this, ...args);
  }

  depcheck(...args): void {
    return depcheckMethod.call(this, ...args);
  }

  getEditorIgnoreConfig(...args) {
    return getEditorIgnoreConfig.call(this, ...args);
  }

  getEslintConfig(...args) {
    return getEslintConfig.call(this, ...args);
  }

  getGithubSyncMetadataConfig(...args) {
    return getGithubSyncMetadataConfig.call(this, ...args);
  }

  getGithubWorkflowConfig(...args) {
    return getGithubWorkflowConfig.call(this, ...args);
  }

  getGitignoreConfig(...args) {
    return getGitignoreConfig.call(this, ...args);
  }

  getGitpodConfig(...args) {
    return getGitpodConfig.call(this, ...args);
  }

  getGitpodDockerfile(...args) {
    return getGitpodDockerfile.call(this, ...args);
  }

  getLicenseString(...args) {
    return getLicenseString.call(this, ...args);
  }

  getReadmeString(...args) {
    return getReadmeString.call(this, ...args);
  }

  getReleaseConfig(...args) {
    return getReleaseConfig.call(this, ...args);
  }

  getRenovateConfig(...args) {
    return getRenovateConfig.call(this, ...args);
  }

  getVscodeConfig(...args) {
    return getVscodeConfig.call(this, ...args);
  }

  getTypescriptConfig(...args) {
    return getTypescriptConfig.call(this, ...args);
  }

  getLintStaged() {
    return getLintStaged.call(this);
  }

  constructor(configInput: PartialConfig<TConfig> = null, { cwd = '.' } = {}) {
    this.cwd = cwd;
    const jitiInstance = createJiti(pathLib.resolve(this.cwd));

    const config = (() => {
      if (configInput === null) {
        return { name: packageName`@dword-design/base-config-node` };
      } else if (typeof configInput === 'string') {
        return { name: configInput };
      } else if (typeof configInput === 'function') {
        return configInput.call(this);
      }

      return configInput;
    })();

    if (config.name) {
      config.name = pluginNameToPackageName(config.name, 'base-config');
    }

    this.packageConfig = fs.existsSync(pathLib.join(this.cwd, 'package.json'))
      ? fs.readJsonSync(pathLib.join(this.cwd, 'package.json'))
      : {};

    const defaultConfig = {
      allowedMatches: [],
      commands: {},
      depcheckConfig: {
        detectors: [
          depcheck.detector.exportDeclaration,
          depcheck.detector.importDeclaration,
          depcheck.detector.requireCallExpression,
          depcheck.detector.requireResolveCallExpression,
          depcheckDetectorExeca,
          depcheckDetectorPackageName,
          depcheckDetectorBinName,
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
      gitignore: [],
      global: false,
      hasTypescriptConfigRootAlias: true,
      isLockFileFixCommitType: false,
      lint: () => {},
      lintStagedConfig: {},
      macos: true,
      minNodeVersion: null,
      nodeVersion: 20,
      packageConfig: {},
      preDeploySteps: [],
      prepare: identity,
      readmeInstallString: endent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install ${config.global ? '-g ' : ''}${this.packageConfig.name}

        # Yarn
        $ yarn ${config.global ? 'global ' : ''}add ${this.packageConfig.name}
        \`\`\`
      `,
      renovateConfig: {},
      seeAlso: [],
      supportedNodeVersions: [20, 22],
      syncKeywords: true,
      testInContainer: false,
      typecheck: () => {},
      typescriptConfig: {},
      useJobMatrix: true,
      windows: true,
    };

    const inheritedConfigPath =
      config.name && config.name === this.packageConfig.name
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
        mergeConfigs(defaultConfig, config),
      );
    }

    this.config = mergeConfigs(config, inheritedConfig, defaultConfig);

    this.config = {
      ...this.config,
      commands: mapValues(this.config.commands, command =>
        typeof command === 'function' ? { handler: command } : command,
      ),
    };

    this.packageConfig = this.getPackageConfig();
    this.generatedFiles = this.getGeneratedFiles();
  }

  // Type guard functions for better type safety
  private isCommandFunction(command: unknown): command is (...args: unknown[]) => unknown {
    return typeof command === 'function';
  }

  private isCommandObject(command: unknown): command is { handler: (...args: unknown[]) => unknown } {
    return (
      command !== null &&
      typeof command === 'object' &&
      'handler' in command &&
      typeof (command as { handler?: unknown }).handler === 'function'
    );
  }

  // Type-safe run method
  run<K extends CommandNames<CommandsRecord<TConfig>>>(
    name: K,
    ...args: CommandParams<CommandsRecord<TConfig>, K>
  ): unknown {
    const command = this.config.commands[name];
    
    if (this.isCommandFunction(command)) {
      return command.call(this, ...args);
    }
    
    if (this.isCommandObject(command)) {
      return command.handler.call(this, ...args);
    }
    
    throw new Error(`Invalid command: ${String(name)}`);
  }
}

export { default as loadConfig } from './load-config';

export { default as loadConfigSync } from './load-config-sync';

export { Base };

export type { 
  Config, 
  PartialConfig, 
  BaseConfig,
  CommandsRecord, 
  CommandDefinition, 
  CommandHandler, 
  CommandObject,
  CommandNames,
  CommandParams
};

export { type PartialCommandOptions } from './commands/command-options-input';
