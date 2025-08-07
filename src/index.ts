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
import type { PackageJson, TsConfigJson } from 'type-fest';

import checkUnknownFiles from './commands/check-unknown-files';
import type { PartialCommandOptions } from './commands/partial-command-options';
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
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile';
import getLicenseString from './get-generated-files/get-license-string';
import getLintStaged from './get-generated-files/get-lint-staged';
import getPackageConfig from './get-generated-files/get-package-config';
import getReadmeString from './get-generated-files/get-readme-string';
import getReleaseConfig from './get-generated-files/get-release';
import getRenovateConfig from './get-generated-files/get-renovate';
import getTypescriptConfig from './get-generated-files/get-typescript';
import getVscodeConfig from './get-generated-files/get-vscode';
import githubCodespacesConfig from './get-generated-files/github-codespaces';
import getGitInfo from './get-git-info';
import { PartialTestOptions } from './commands/partial-test-options';

type HandlerWithBase<TConfig extends Config = Config> = (
  this: Base<TConfig>,
  ...args: unknown[]
) => unknown;

type PartialCommandObjectInObjectWithBase<TConfig extends Config = Config> =
  Omit<PartialCommandObjectInObject, 'handler'> & {
    handler: (this: Base<TConfig>, ...args: unknown[]) => unknown;
  };

type PartialCommandInObjectWithBase<TConfig extends Config = Config> =
  | PartialCommandObjectInObjectWithBase<TConfig>
  | HandlerWithBase<TConfig>;

// Extract parameter types from command handlers
type ExtractHandlerParams<T> = T extends {
  handler: (this: any, ...args: infer P) => any;
}
  ? P
  : T extends (this: any, ...args: infer P) => any
  ? P
  : unknown[];

// Get command names from the commands object
type CommandNames<TConfig extends Config> = keyof TConfig['commands'];

// Get parameters for a specific command
type CommandParams<
  TConfig extends Config,
  TCommandName extends CommandNames<TConfig>
> = ExtractHandlerParams<TConfig['commands'][TCommandName]>;

type Config = {
  name?: string;
  global: boolean;
  allowedMatches: string[];
  commands: Record<string, PartialCommandObjectInObjectWithBase>;
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
  npmPublish: boolean;
  codecovGraphToken: string | null;
};

type PartialConfigObject<TConfig extends Config = Config> = Omit<
  Partial<TConfig>,
  'commands'
> & { commands?: Record<string, PartialCommandInObjectWithBase<TConfig>> };

type PartialConfigOrFunction<TConfig extends Config = Config> =
  | PartialConfigObject<TConfig>
  | ((this: Base<TConfig>, config: TConfig) => PartialConfigObject<TConfig>);

type PartialConfig<TConfig extends Config = Config> =
  | PartialConfigOrFunction<TConfig>
  | string
  | null;

export const defineBaseConfig = <T>(configInput: T): T => configInput;

const mergeConfigs = createDefu(<T, K extends keyof T>(obj: T, key: K, value: T[K]) => {
  if (key === 'supportedNodeVersions') {
    obj[key] = value;
    return true;
  }

  return false;
});

class Base<TConfig extends Config = Config> {
  config: TConfig;
  packageConfig: PackageJson;
  cwd: string;
  generatedFiles;
  githubCodespacesConfig = githubCodespacesConfig;

  commit(this: Base, options?: PartialCommandOptions & { allowEmpty?: boolean }) {
    return commit.call(this, options);
  }

  lint(options?: PartialCommandOptions) {
    return lint.call(this, options);
  }

  lintPackagejson() {
    return lintPackagejson.call(this);
  }

  typecheck(options?: PartialCommandOptions) {
    return typecheck.call(this, options);
  }

  verify(options?: PartialCommandOptions & { patterns?: string[] }) {
    return verify.call(this, options);
  }

  prepare(options?: PartialCommandOptions) {
    return prepare.call(this, options);
  }

  test(options?: PartialTestOptions) {
    return test.call(this, options);
  }

  testRaw(options?: PartialTestOptions) {
    return testRaw.call(this, options);
  }

  testDocker(options?: PartialTestOptions) {
    return testDocker.call(this, options);
  }

  getPackageConfig() {
    return getPackageConfig.call(this);
  }

  getGeneratedFiles() {
    return getGeneratedFiles.call(this);
  }

  checkUnknownFiles() {
    return checkUnknownFiles.call(this);
  }

  depcheck() {
    return depcheckMethod.call(this);
  }

  getEditorIgnoreConfig() {
    return getEditorIgnoreConfig.call(this);
  }

  getEslintConfig() {
    return getEslintConfig.call(this);
  }

  getGithubSyncMetadataConfig() {
    return getGithubSyncMetadataConfig.call(this);
  }

  getGithubWorkflowConfig() {
    return getGithubWorkflowConfig.call(this);
  }

  getGitignoreConfig() {
    return getGitignoreConfig.call(this);
  }

  getGitpodDockerfile() {
    return getGitpodDockerfile.call(this);
  }

  getLicenseString() {
    return getLicenseString.call(this);
  }

  getReadmeString() {
    return getReadmeString.call(this);
  }

  getReleaseConfig() {
    return getReleaseConfig.call(this);
  }

  getRenovateConfig() {
    return getRenovateConfig.call(this);
  }

  getVscodeConfig() {
    return getVscodeConfig.call(this);
  }

  getTypescriptConfig() {
    return getTypescriptConfig.call(this);
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
      codecovGraphToken: null,
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

  run<TCommandName extends keyof TConfig['commands'] & string>(
    name: TCommandName,
    ...args: CommandParams<TConfig, TCommandName>
  ) {
    return this.config.commands[name].handler.call(this, ...args);
  }
}

export { default as loadConfig } from './load-config';

export { default as loadConfigSync } from './load-config-sync';

export { Base };

export type { Config, PartialConfig };

export { type PartialCommandOptions } from './commands/partial-command-options';
