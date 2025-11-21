import gitHubAction from 'tagged-template-noop';

import checkUnknownFilesSteps from '@/src/get-generated-files/get-github-workflow/steps/check-unknown-files';
import coverageSteps from '@/src/get-generated-files/get-github-workflow/steps/coverage';
import getReleaseSteps from '@/src/get-generated-files/get-github-workflow/steps/get-release';
import getTestSteps from '@/src/get-generated-files/get-github-workflow/steps/get-test';

export default function () {
  return {
    release: {
      needs: 'test',
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          uses: gitHubAction`actions/checkout@v4`,
          with: {
            lfs: true,
            ref: "${{ github.event.pull_request.head.repo.full_name == github.repository && github.event.pull_request.head.ref || '' }}",
          },
        },
        {
          uses: gitHubAction`actions/setup-node@v4`,
          with: {
            'node-version': this.config.nodeVersion,
            'registry-url': 'https://registry.npmjs.org',
          },
        },
        { run: 'corepack enable' },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'pnpm install --frozen-lockfile' },
        ...checkUnknownFilesSteps,
        { run: 'pnpm lint' },
        ...getReleaseSteps.call(this),
      ],
    },
    test: {
      'runs-on': '${{ matrix.os }}',
      steps: [
        {
          uses: gitHubAction`actions/checkout@v4`,
          with: {
            ...(this.config.fetchGitHistory && { 'fetch-depth': 0 }),
            lfs: true,
          },
        },
        {
          uses: gitHubAction`actions/setup-node@v4`,
          with: { 'check-latest': true, 'node-version': '${{ matrix.node }}' },
        },
        { run: 'corepack enable' },
        { run: 'pnpm install --frozen-lockfile' },
        ...getTestSteps.call(this),
        ...coverageSteps.map(step => ({
          if: `matrix.os == 'ubuntu-latest' && matrix.node == ${this.config.nodeVersion}`,
          ...step,
        })),
      ],
      strategy: {
        matrix: {
          include: [
            ...this.config.supportedNodeVersions.map(version => ({
              node: version,
              os: 'ubuntu-latest',
            })),
            ...(this.config.macos
              ? [{ node: this.config.nodeVersion, os: 'macos-latest' }]
              : []),
            ...(this.config.windows
              ? [{ node: this.config.nodeVersion, os: 'windows-latest' }]
              : []),
          ],
        },
      },
    },
  };
}
