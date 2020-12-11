import { map } from '@dword-design/functions'

import config from '@/src/config'
import cancelExistingSteps from '@/src/generated-files/github-workflow/steps/cancel-existing'
import releaseSteps from '@/src/generated-files/github-workflow/steps/release'
import testSteps from '@/src/generated-files/github-workflow/steps/test'

export default {
  jobs: {
    build: {
      if: "!contains(github.event.head_commit.message, '[skip ci]')",
      'runs-on': 'ubuntu-latest',
      steps: [
        ...cancelExistingSteps,
        { uses: 'actions/checkout@v2' },
        {
          uses: 'actions/setup-node@v1',
          with: {
            'node-version': config.nodeVersion,
          },
        },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'yarn --frozen-lockfile' },
        ...testSteps,
        ...(releaseSteps
          |> map(step => ({
            if: "github.ref == 'refs/heads/master'",
            ...step,
          }))),
      ],
    },
  },
  name: 'build',
  on: {
    push: {
      branches: ['**'],
    },
  },
}