import { createRequire } from 'node:module';
import getTypescriptConfig from './get-typescript';
import getGitpodDockerfile from './get-gitpod-dockerfile';
import getGitpodConfig from './get-gitpod';
import getLintStaged from './get-lint-staged';
import getReleaseConfig from './get-release';
import getRenovateConfig from './get-renovate';
import getVscodeConfig from './get-vscode';
import getEslintConfig from './get-eslint';
import getReadmeString from './get-readme-string';
import getLicenseString from './get-license-string';

import fs from 'fs-extra';
import { stringify as stringifyIni } from 'ini';
import sortKeys from 'sort-keys';
import sortPackageJson from 'sort-package-json';
import { stringify as yamlStringify } from 'yaml';

import type { Base } from '@/src';

import commitizenConfig from './commitizen';
import commitlintConfig from './commitlint';
import editorconfigConfig from './editorconfig';
import eslintLintStaged from './eslint-lint-staged';
import gitattributesConfig from './gitattributes';
import githubCodespacesConfig from './github-codespaces';
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies';
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template';
import githubFunding from './github-funding';
import githubLabelsConfig from './github-labels';
import githubSyncLabelsConfig from './github-sync-labels';
import npmrc from './npmrc';
import getGitignoreConfig from './get-gitignore';
import getGithubWorkflowConfig from './get-github-workflow';
import getGithubSyncMetadataConfig from './get-github-sync-metadata';

const resolver = createRequire(import.meta.url);

export default (base: Base) => ({
  '.commitlintrc.json': `${JSON.stringify(commitlintConfig, undefined, 2)}\n`,
  '.cz.json': `${JSON.stringify(commitizenConfig, undefined, 2)}\n`,
  '.devcontainer/devcontainer.json': `${JSON.stringify(
    githubCodespacesConfig,
    undefined,
    2,
  )}\n`,
  '.editorconfig': editorconfigConfig,
  '.gitattributes': gitattributesConfig,
  '.github/DEPRECATED_DEPENDENCIES_ISSUE_TEMPLATE.md':
    deprecatedDependenciesIssueTemplate,
  '.github/FUNDING.yml': yamlStringify(githubFunding),
  '.github/labels.yml': yamlStringify(
    sortKeys(githubLabelsConfig, { deep: true }),
  ),
  '.github/workflows/build.yml': yamlStringify(
    sortKeys(getGithubWorkflowConfig(base), { deep: true }),
  ),
  '.github/workflows/deprecated-dependencies.yml': yamlStringify(
    sortKeys(githubDeprecatedDependenciesConfig, { deep: true }),
  ),
  '.github/workflows/sync-labels.yml': yamlStringify(
    sortKeys(githubSyncLabelsConfig, { deep: true }),
  ),
  '.github/workflows/sync-metadata.yml': yamlStringify(
    sortKeys(getGithubSyncMetadataConfig(base), { deep: true }),
  ),
  '.gitignore': getGitignoreConfig(base)
    .map(entry => `${entry}\n`)
    .join(''),
  '.gitpod.Dockerfile': getGitpodDockerfile(base),
  '.gitpod.yml': yamlStringify(getGitpodConfig(base)),
  '.lintstagedrc.json': `${JSON.stringify(getLintStaged(base), undefined, 2)}\n`,
  '.npmrc': stringifyIni(npmrc),
  '.releaserc.json': `${JSON.stringify(
    getReleaseConfig(base),
    undefined,
    2,
  )}\n`,
  '.renovaterc.json': `${JSON.stringify(
    sortKeys(getRenovateConfig(base), { deep: true }),
    undefined,
    2,
  )}\n`,
  '.vscode/settings.json': `${JSON.stringify(
    getVscodeConfig(base),
    undefined,
    2,
  )}\n`,
  'AGENTS.md': fs.readFileSync(resolver.resolve('./agents.md'), 'utf8'),
  'eslint.config.ts': getEslintConfig(base),
  'eslint.lint-staged.config.ts': eslintLintStaged,
  'LICENSE.md': getLicenseString(base),
  'package.json': `${JSON.stringify(
    sortPackageJson(base.packageConfig),
    undefined,
    2,
  )}\n`,
  'README.md': getReadmeString(base),
  'tsconfig.json': `${JSON.stringify(sortKeys(getTypescriptConfig(base), { deep: true }), undefined, 2)}\n`,
});
