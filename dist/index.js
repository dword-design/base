import pathLib from 'node:path';

import dedent from 'dedent';
import deepmerge from 'deepmerge';
import depcheck from 'depcheck';
import depcheckDetectorBinName from 'depcheck-detector-bin-name';
import depcheckDetectorExeca from 'depcheck-detector-execa';
import depcheckDetectorPackageName from 'depcheck-detector-package-name';
import packageName from 'depcheck-package-name';
import fs from 'fs-extra';
import { createJiti } from 'jiti';
import { identity, mapValues } from 'lodash-es';
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name';

import checkUnknownFiles from './commands/check-unknown-files/index.js';
import commit from './commands/commit/index.js';
import depcheckMethod from './commands/depcheck/index.js';
import lint from './commands/lint/index.js';
import prepare from './commands/prepare/index.js';
import test from './commands/test/index.js';
import testDocker from './commands/test-docker/index.js';
import testRaw from './commands/test-raw/index.js';
import getDepcheckSpecialBase from './get-depcheck-special-base/index.js';
import getEditorIgnoreConfig from './get-generated-files/get-editor-ignore/index.js';
import getEslintConfig from './get-generated-files/get-eslint/index.js';
import getGithubSyncMetadataConfig from './get-generated-files/get-github-sync-metadata/index.js';
import getGithubWorkflowConfig from './get-generated-files/get-github-workflow/index.js';
import getGitignoreConfig from './get-generated-files/get-gitignore/index.js';
import getGitpodConfig from './get-generated-files/get-gitpod/index.js';
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile.js';
import getLicenseString from './get-generated-files/get-license-string.js';
import getPackageConfig from './get-generated-files/get-package-config/index.js';
import getReadmeString from './get-generated-files/get-readme-string/index.js';
import getReleaseConfig from './get-generated-files/get-release/index.js';
import getRenovateConfig from './get-generated-files/get-renovate/index.js';
import getVscodeConfig from './get-generated-files/get-vscode/index.js';
import githubCodespacesConfig from './get-generated-files/github-codespaces.js';
import getGeneratedFiles from './get-generated-files/index.js';
import getGitInfo from './get-git-info/index.js';

const mergeConfigs = (...configs) => {
  const result = deepmerge.all(configs, {
    customMerge: key =>
      key === 'supportedNodeVersions' ? (a, b) => b : undefined,
  });

  return result;
};

class Base {
  config;
  packageConfig;
  cwd;
  generatedFiles;
  githubCodespacesConfig = githubCodespacesConfig;
  commit(...args) {
    return commit.call(this, ...args);
  }
  lint(...args) {
    return lint.call(this, ...args);
  }
  prepare(...args) {
    return prepare.call(this, ...args);
  }
  test(...args) {
    return test.call(this, ...args);
  }
  testRaw(...args) {
    return testRaw.call(this, ...args);
  }
  testDocker(...args) {
    return testDocker.call(this, ...args);
  }
  getPackageConfig(...args) {
    return getPackageConfig.call(this, ...args);
  }
  getGeneratedFiles(...args) {
    return getGeneratedFiles.call(this, ...args);
  }
  checkUnknownFiles(...args) {
    return checkUnknownFiles.call(this, ...args);
  }
  depcheck(...args) {
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
  constructor(config = null, { cwd = '.' } = {}) {
    this.cwd = cwd;

    const jitiInstance = createJiti(pathLib.resolve(this.cwd), {
      interopDefault: true,
    });

    if (config === null) {
      config = { name: packageName`@dword-design/base-config-node` };
    }

    if (typeof config === 'function') {
      config = config.call(this);
    }

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
      fetchGitHistory: false,
      git: getGitInfo({ cwd: this.cwd }),
      gitignore: [],
      lint: identity,
      macos: true,
      minNodeVersion: null,
      nodeVersion: 20,
      preDeploySteps: [],
      prepare: identity,
      readmeInstallString: dedent`
        ## Install

        \`\`\`bash
        # npm
        $ npm install ${config.global ? '-g ' : ''}${this.packageConfig.name}

        # Yarn
        $ yarn ${config.global ? 'global ' : ''}add ${this.packageConfig.name}
        \`\`\`
      `,
      seeAlso: [],
      supportedNodeVersions: [18, 20],
      syncKeywords: true,
      testRunner: 'mocha',
      windows: true,
    };

    const configsToMerge = [defaultConfig];

    if (config.name) {
      const inheritedConfigPath =
        config.name === this.packageConfig.name
          ? pathLib.resolve(this.cwd, 'src', 'index.js')
          : config.name;

      let inheritedConfig = inheritedConfigPath
        ? jitiInstance(inheritedConfigPath)
        : undefined;

      if (typeof inheritedConfig === 'function') {
        inheritedConfig = inheritedConfig.call(
          this,
          mergeConfigs(defaultConfig, config),
        );
      }

      configsToMerge.push(inheritedConfig);
    }

    configsToMerge.push(config);
    this.config = mergeConfigs(...configsToMerge);

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

export { default as loadConfig } from './load-config/index.js';

export { default as loadConfigSync } from './load-config-sync/index.js';

export { Base };
