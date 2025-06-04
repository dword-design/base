import * as pathLib from 'node:path';

import dedent from 'dedent';
import deepmerge from 'deepmerge';
import depcheck from 'depcheck';
import depcheckDetectorBinName from 'depcheck-detector-bin-name';
import depcheckDetectorExeca from 'depcheck-detector-execa';
import depcheckDetectorPackageName from 'depcheck-detector-package-name';
import packageName from 'depcheck-package-name';
import depcheckParserBabel from 'depcheck-parser-babel';
import fs from 'fs-extra';
import { createJiti } from 'jiti';
import { identity, mapValues } from 'lodash-es';
import { transform as pluginNameToPackageName } from 'plugin-name-to-package-name';

import './commands/check-unknown-files/index.js';
import './commands/commit/index.js';
import './commands/depcheck/index.js';
import './commands/lint/index.js';
import './commands/prepare/index.js';
import './commands/test/index.js';
import './commands/test-docker/index.js';
import './commands/test-raw/index.js';
import getDepcheckSpecialBase from './get-depcheck-special-base/index.js';
import getEditorIgnoreConfig from './get-generated-files/get-editor-ignore/index.js';
import getEslintConfig from './get-generated-files/get-eslint/index.js';
import getGithubSyncMetadataConfig from './get-generated-files/get-github-sync-metadata/index.js';
import getGithubWorkflowConfig from './get-generated-files/get-github-workflow/index.js';
import getGitignoreConfig from './get-generated-files/get-gitignore/index.js';
import getGitpodConfig from './get-generated-files/get-gitpod/index.js';
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile.js';
import getLicenseString from './get-generated-files/get-license-string.js';
import './get-generated-files/get-package-config/index.js';
import getReadmeString from './get-generated-files/get-readme-string/index.js';
import getReleaseConfig from './get-generated-files/get-release/index.js';
import getRenovateConfig from './get-generated-files/get-renovate/index.js';
import getVscodeConfig from './get-generated-files/get-vscode/index.js';
import githubCodespacesConfig from './get-generated-files/github-codespaces.js';
import './get-generated-files/index.js';
import getGitInfo from './get-git-info/index.js';

const mergeConfigs = (...configs) => {
  const result = deepmerge.all(configs, {
    customMerge: key =>
      key === 'supportedNodeVersions' ? (a, b) => b : undefined,
  });

  return result;
};

class Base {
  config: any;
  packageConfig: any;
  cwd: string;
  generatedFiles: any;

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
        parsers: { '**/*.js': depcheckParserBabel },
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

Object.assign(Base.prototype, {
  getEditorIgnoreConfig,
  getEslintConfig,
  getGithubSyncMetadataConfig,
  getGithubWorkflowConfig,
  getGitignoreConfig,
  getGitpodConfig,
  getGitpodDockerfile,
  getLicenseString,
  getReadmeString,
  getReleaseConfig,
  getRenovateConfig,
  getVscodeConfig,
  githubCodespacesConfig,
});

export { Base };

export { default as loadConfig } from './load-config/index.js';

export { default as loadConfigSync } from './load-config-sync/index.js';
