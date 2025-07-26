import gitHubAction from 'tagged-template-noop';

import coverageSteps from '@/src/get-generated-files/get-github-workflow/steps/coverage';
import getReleaseSteps from '@/src/get-generated-files/get-github-workflow/steps/get-release';
import getVerifySteps from '@/src/get-generated-files/get-github-workflow/steps/get-verify';

export default function () {
  return {
    build: {
      if: "!contains(github.event.head_commit.message, '[skip ci]')",
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          uses: gitHubAction`actions/checkout@v4`,
          with: {
            ...(this.config.fetchGitHistory && { 'fetch-depth': 0 }),
            lfs: true,
            ref: "${{ github.event.pull_request.head.repo.full_name == github.repository && github.event.pull_request.head.ref || '' }}",
          },
        },
        {
          uses: gitHubAction`actions/setup-node@v4`,
          with: {
            'check-latest': true,
            'node-version': this.config.nodeVersion,
          },
        },
        { run: 'corepack enable' },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'pnpm install --frozen-lockfile' },
        ...getVerifySteps.call(this),
        ...coverageSteps,
        ...getReleaseSteps.call(this),
      ],
    },
  };
}
