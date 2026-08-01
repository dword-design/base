import { createRequire } from 'node:module';

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
    sortKeys(base.getGithubWorkflowConfig(), { deep: true }),
  ),
  '.github/workflows/deprecated-dependencies.yml': yamlStringify(
    sortKeys(githubDeprecatedDependenciesConfig, { deep: true }),
  ),
  '.github/workflows/sync-labels.yml': yamlStringify(
    sortKeys(githubSyncLabelsConfig, { deep: true }),
  ),
  '.github/workflows/sync-metadata.yml': yamlStringify(
    sortKeys(base.getGithubSyncMetadataConfig(), { deep: true }),
  ),
  '.gitignore': base
    .getGitignoreConfig()
    .map(entry => `${entry}\n`)
    .join(''),
  '.gitpod.Dockerfile': base.getGitpodDockerfile(),
  '.gitpod.yml': yamlStringify(base.getGitpodConfig()),
  '.lintstagedrc.json': `${JSON.stringify(base.getLintStaged(), undefined, 2)}\n`,
  '.npmrc': stringifyIni(npmrc),
  '.releaserc.json': `${JSON.stringify(
    base.getReleaseConfig(),
    undefined,
    2,
  )}\n`,
  '.renovaterc.json': `${JSON.stringify(
    sortKeys(base.getRenovateConfig(), { deep: true }),
    undefined,
    2,
  )}\n`,
  '.vscode/settings.json': `${JSON.stringify(
    base.getVscodeConfig(),
    undefined,
    2,
  )}\n`,
  'AGENTS.md': fs.readFileSync(resolver.resolve('./agents.md'), 'utf8'),
  'eslint.config.ts': base.getEslintConfig(),
  'eslint.lint-staged.config.ts': eslintLintStaged,
  'LICENSE.md': base.getLicenseString(),
  'package.json': `${JSON.stringify(
    sortPackageJson(base.packageConfig),
    undefined,
    2,
  )}\n`,
  'README.md': base.getReadmeString(),
  'tsconfig.json': `${JSON.stringify(sortKeys(base.getTypescriptConfig(), { deep: true }), undefined, 2)}\n`,
});
