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
import getPackageConfig from './get-generated-files/get-package-config';
import getReadmeString from './get-generated-files/get-readme-string';
import getReleaseConfig from './get-generated-files/get-release';
import getRenovateConfig from './get-generated-files/get-renovate';
import getTypescriptConfig from './get-generated-files/get-typescript';
import getVscodeConfig from './get-generated-files/get-vscode';
import githubCodespacesConfig from './get-generated-files/github-codespaces';
import getGitInfo from './get-git-info';

type HandlerWithBase = (this: Base, ...args: unknown[]) => unknown;
type PartialCommandObjectInObjectWithBase = Omit<
  PartialCommandObjectInObject,
  'handler'
> & { handler: (this: Base, ...args: unknown[]) => unknown };
type PartialCommandInObjectWithBase =
  | PartialCommandObjectInObjectWithBase
  | HandlerWithBase;
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
  lint: (options?: PartialCommandOptions) => unknown;
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
};
type PartialConfigObject = Omit<Partial<Config>, 'commands'> & {
  commands?: Record<string, PartialCommandInObjectWithBase>;
};
type PartialConfigOrFunction =
  | PartialConfigObject
  | ((this: Base, config: Config) => PartialConfigObject);
type PartialConfig = PartialConfigOrFunction | string | null;

export const defineBaseConfig = (configInput: PartialConfig) => configInput;

const mergeConfigs = createDefu((obj, key, value) => {
  if (key === 'supportedNodeVersions') {
    obj[key] = value;
    return true;
  }

  return false;
});

class Base {
  config: Config;
  packageConfig: PackageJson;
  cwd: string;
  generatedFiles;
  githubCodespacesConfig = githubCodespacesConfig;

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

  constructor(configInput: PartialConfig = null, { cwd = '.' } = {}) {
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
      editorIgnore: [],
      eslintConfig: '',
      fetchGitHistory: false,
      git: getGitInfo({ cwd: this.cwd }),
      gitignore: [],
      global: false,
      hasTypescriptConfigRootAlias: true,
      isLockFileFixCommitType: false,
      lint: () => {},
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
      typescriptConfig: {},
      useJobMatrix: true,
      windows: true,
    };

    const inheritedConfigPath =
      config.name && config.name === this.packageConfig.name
        ? pathLib.resolve(this.cwd, 'src', 'index.ts')
        : config.name;

    let inheritedConfig:
      | PartialConfigOrFunction
      | { default: PartialConfigOrFunction } = inheritedConfigPath
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

  run(name, ...args) {
    return this.config.commands[name].handler.call(this, ...args);
  }
}

export { default as loadConfig } from './load-config';

export { default as loadConfigSync } from './load-config-sync';

export { Base };

export type { Config, PartialConfig };

export { type PartialCommandOptions } from './commands/command-options-input';
