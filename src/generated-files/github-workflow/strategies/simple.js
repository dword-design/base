import { map } from '@dword-design/functions'

import cancelExistingSteps from '@/src/generated-files/github-workflow/steps/cancel-existing'
import releaseSteps from '@/src/generated-files/github-workflow/steps/release'
import testSteps from '@/src/generated-files/github-workflow/steps/test'

export default {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        ...cancelExistingSteps,
        { uses: 'actions/checkout@v2' },
        {
          uses: 'actions/setup-node@v1',
          with: {
            'node-version': 12,
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
