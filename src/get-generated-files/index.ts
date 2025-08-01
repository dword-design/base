import { stringify as stringifyIni } from 'ini';
import sortKeys from 'sort-keys';
import sortPackageJson from 'sort-package-json';
import { stringify as yamlStringify } from 'yaml';

import commitizenConfig from './commitizen';
import commitlintConfig from './commitlint';
import editorconfigConfig from './editorconfig';
import eslintLintStaged from './eslint-lint-staged';
import gitattributesConfig from './gitattributes';
import githubCodespacesPostcreate from './github-codespaces-postcreate';
import githubDeprecatedDependenciesConfig from './github-deprecated-dependencies';
import deprecatedDependenciesIssueTemplate from './github-deprecated-dependencies-issue-template';
import githubFunding from './github-funding';
import githubLabelsConfig from './github-labels';
import githubSyncLabelsConfig from './github-sync-labels';
import npmrc from './npmrc';

export default function () {
  const packageConfig = this.getPackageConfig();
  return {
    '.commitlintrc.json': `${JSON.stringify(commitlintConfig, undefined, 2)}\n`,
    '.cz.json': `${JSON.stringify(commitizenConfig, undefined, 2)}\n`,
    '.devcontainer': {
      'devcontainer.json': `${JSON.stringify(
        this.githubCodespacesConfig,
        undefined,
        2,
      )}\n`,
      'postcreate.sh': githubCodespacesPostcreate,
    },
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
    '.lintstagedrc.json': `${JSON.stringify(this.getLintStaged(), undefined, 2)}\n`,
    '.npmrc': stringifyIni(npmrc),
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
    'eslint.config.ts': this.getEslintConfig(),
    'eslint.lint-staged.config.ts': eslintLintStaged,
    'package.json': `${JSON.stringify(
      sortPackageJson(packageConfig),
      undefined,
      2,
    )}\n`,
    'tsconfig.json': `${JSON.stringify(sortKeys(this.getTypescriptConfig(), { deep: true }), undefined, 2)}\n`,
  };
}
