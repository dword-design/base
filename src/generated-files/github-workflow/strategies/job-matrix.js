import { map } from '@dword-design/functions'

import cancelExistingSteps from '@/src/generated-files/github-workflow/steps/cancel-existing'
import checkUnknownFilesSteps from '@/src/generated-files/github-workflow/steps/check-unknown-files'
import coverageSteps from '@/src/generated-files/github-workflow/steps/coverage'
import releaseSteps from '@/src/generated-files/github-workflow/steps/release'
import testSteps from '@/src/generated-files/github-workflow/steps/test'

export default config => ({
  jobs: {
    'cancel-existing': {
      if: "!contains(github.event.head_commit.message, '[skip ci]')",
      'runs-on': 'ubuntu-latest',
      steps: cancelExistingSteps,
    },
    release: {
      needs: 'test',
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v2', with: { lfs: true } },
        {
          uses: 'actions/setup-node@v2',
          with: {
            'node-version': 12,
          },
        },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'yarn --frozen-lockfile' },
        ...checkUnknownFilesSteps,
        { run: 'yarn lint' },
        ...releaseSteps,
      ],
    },
    test: {
      needs: 'cancel-existing',
      'runs-on': '${{ matrix.os }}',
      steps: [
        { uses: 'actions/checkout@v2', with: { 'fetch-depth': 0, lfs: true } },
        {
          uses: 'actions/setup-node@v2',
          with: {
            'node-version': '${{ matrix.node }}',
          },
        },
        { run: 'yarn --frozen-lockfile' },
        ...testSteps,
        ...(coverageSteps
          |> map(step => ({
            if: "matrix.os == 'ubuntu-latest' && matrix.node == 12",
            ...step,
          }))),
      ],
      strategy: {
        matrix: {
          ...(!config.testInContainer && {
            exclude: [
              { node: 10, os: 'macos-latest' },
              { node: 10, os: 'windows-latest' },
            ],
          }),
          node: [10, 12],
          os: [
            ...(config.testInContainer
              ? []
              : ['macos-latest', 'windows-latest']),
            'ubuntu-latest',
          ],
        },
      },
    },
  },
})
