import cancelExistingSteps from '@/src/generated-files/github-workflow/steps/cancel-existing'
import checkUnknownFilesSteps from '@/src/generated-files/github-workflow/steps/check-unknown-files'
import coverageSteps from '@/src/generated-files/github-workflow/steps/coverage'
import releaseSteps from '@/src/generated-files/github-workflow/steps/release'
import testSteps from '@/src/generated-files/github-workflow/steps/test'

export default config => ({
  build: {
    if: "!contains(github.event.head_commit.message, '[skip ci]')",
    'runs-on': 'ubuntu-latest',
    steps: [
      ...cancelExistingSteps,
      {
        uses: 'actions/checkout@v3',
        with: {
          'fetch-depth': 0,
          lfs: true,
          ref: "${{ github.event.pull_request.head.repo.full_name == github.repository && github.event.pull_request.head.ref || '' }}",
        },
      },
      {
        uses: 'actions/setup-node@v3',
        with: {
          'node-version': config.nodeVersion,
        },
      },
      { run: 'git config --global user.email "actions@github.com"' },
      { run: 'git config --global user.name "GitHub Actions"' },
      { run: 'yarn --frozen-lockfile' },
      ...testSteps,
      ...coverageSteps,
      ...checkUnknownFilesSteps,
      ...releaseSteps,
    ],
  },
})
