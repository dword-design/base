import cancelExistingSteps from '@/src/get-generated-files/get-github-workflow/steps/cancel-existing'
import checkUnknownFilesSteps from '@/src/get-generated-files/get-github-workflow/steps/check-unknown-files'
import coverageSteps from '@/src/get-generated-files/get-github-workflow/steps/coverage'
import getReleaseSteps from '@/src/get-generated-files/get-github-workflow/steps/get-release'
import getTestSteps from '@/src/get-generated-files/get-github-workflow/steps/get-test'

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
      ...getTestSteps(),
      ...coverageSteps,
      ...checkUnknownFilesSteps,
      ...getReleaseSteps(config),
    ],
  },
})
