import pathLib from 'node:path';
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
import getDepcheckSpecialBase from './get-depcheck-special-base';
import getGitInfo from './get-git-info';
import checkUnknownFiles from './commands/check-unknown-files';
import getPackageConfig from './get-generated-files/get-package-config';
import getGeneratedFiles from './get-generated-files';
import getEditorIgnoreConfig from './get-generated-files/get-editor-ignore';
import getEslintConfig from './get-generated-files/get-eslint';
import getGithubSyncMetadataConfig from './get-generated-files/get-github-sync-metadata';
import getGithubWorkflowConfig from './get-generated-files/get-github-workflow';
import getGitignoreConfig from './get-generated-files/get-gitignore';
import getGitpodConfig from './get-generated-files/get-gitpod';
import getGitpodDockerfile from './get-generated-files/get-gitpod-dockerfile';
import getLicenseString from './get-generated-files/get-license-string';
import getReadmeString from './get-generated-files/get-readme-string';
import getReleaseConfig from './get-generated-files/get-release';
import getRenovateConfig from './get-generated-files/get-renovate';
import getVscodeConfig from './get-generated-files/get-vscode';
import githubCodespacesConfig from './get-generated-files/github-codespaces';
const mergeConfigs = (...configs) => {
    const result = deepmerge.all(configs, {
        customMerge: key => key === 'supportedNodeVersions' ? (a, b) => b : undefined,
    });
    return result;
};
class Base {
    config;
    packageConfig;
    cwd;
    generatedFiles;
    getPackageConfig() {
        return getPackageConfig.call(this);
    }
    getGeneratedFiles() {
        return getGeneratedFiles.call(this);
    }
    checkUnknownFiles() {
        return checkUnknownFiles.call(this);
    }
    constructor(config = null, { cwd = '.' } = {}) {
        this.cwd = cwd;
        const jitiInstance = createJiti(pathLib.resolve(this.cwd), {
            interopDefault: true,
        });
        if (config === null) {
            config = { name: packageName `@dword-design/base-config-node` };
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
            readmeInstallString: dedent `
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
            const inheritedConfigPath = config.name === this.packageConfig.name
                ? pathLib.resolve(this.cwd, 'src', 'index.js')
                : config.name;
            let inheritedConfig = inheritedConfigPath
                ? jitiInstance(inheritedConfigPath)
                : undefined;
            if (typeof inheritedConfig === 'function') {
                inheritedConfig = inheritedConfig.call(this, mergeConfigs(defaultConfig, config));
            }
            configsToMerge.push(inheritedConfig);
        }
        configsToMerge.push(config);
        this.config = mergeConfigs(...configsToMerge);
        this.config = {
            ...this.config,
            commands: mapValues(this.config.commands, command => typeof command === 'function' ? { handler: command } : command),
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
export { default as loadConfig } from './load-config/index.js';
export { default as loadConfigSync } from './load-config-sync/index.js';
export { Base };
