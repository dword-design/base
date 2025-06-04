import sortKeys from 'sort-keys';
import sortPackageJson from 'sort-package-json';
import { stringify as yamlStringify } from 'yaml';

import commitizenConfig from './commitizen.js';
import commitlintConfig from './commitlint.js';
import editorconfigConfig from './editorconfig.js';
import gitattributesConfig from './gitattributes.js';
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies/index.js';
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template.js';
import githubFunding from './github-funding.js';
import githubLabelsConfig from './github-labels.js';
import githubSyncLabelsConfig from './github-sync-labels.js';
import npmrc from './npmrc.js';
import typescriptConfig from './typescript/index.js';
import { Base } from '@/src';

declare module '@/src' {
  interface Base {
    getGeneratedFiles(): any;
  }
}

Base.prototype.getGeneratedFiles = function () {
  const packageConfig = this.getPackageConfig();
  return {
    '.commitlintrc.json': `${JSON.stringify(commitlintConfig, undefined, 2)}\n`,
    '.cz.json': `${JSON.stringify(commitizenConfig, undefined, 2)}\n`,
    '.devcontainer/devcontainer.json': `${JSON.stringify(
      this.githubCodespacesConfig,
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
      sortKeys(this.getGithubWorkflowConfig(), { deep: true }),
    ),
    '.github/workflows/deprecated-dependencies.yml': yamlStringify(
      sortKeys(githubDeprecatedDependenciesConfig, { deep: true }),
    ),
    '.github/workflows/sync-labels.yml': yamlStringify(
      sortKeys(githubSyncLabelsConfig, { deep: true }),
    ),
    '.github/workflows/sync-metadata.yml': yamlStringify(
      sortKeys(this.getGithubSyncMetadataConfig(), { deep: true }),
    ),
    '.gitignore': this.getGitignoreConfig()
      .map(entry => `${entry}\n`)
      .join(''),
    '.gitpod.Dockerfile': this.getGitpodDockerfile(),
    '.gitpod.yml': yamlStringify(this.getGitpodConfig()),
    '.npmrc': `${npmrc}\n`,
    '.releaserc.json': `${JSON.stringify(
      this.getReleaseConfig(),
      undefined,
      2,
    )}\n`,
    '.renovaterc.json': `${JSON.stringify(
      sortKeys(this.getRenovateConfig(), { deep: true }),
      undefined,
      2,
    )}\n`,
    '.vscode/settings.json': `${JSON.stringify(
      this.getVscodeConfig(),
      undefined,
      2,
    )}\n`,
    'LICENSE.md': this.getLicenseString(),
    'README.md': this.getReadmeString(),
    'eslint.config.js': this.getEslintConfig(),
    'package.json': `${JSON.stringify(
      sortPackageJson(packageConfig),
      undefined,
      2,
    )}\n`,
    'tsconfig.json': `${JSON.stringify(typescriptConfig, undefined, 2)}\n`,
  };
}
