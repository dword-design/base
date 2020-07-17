import cancelExistingSteps from '@/src/generated-files/github-workflow/steps/cancel-existing'
import releaseSteps from '@/src/generated-files/github-workflow/steps/release'
import testSteps from '@/src/generated-files/github-workflow/steps/test'

export default {
  jobs: {
    'cancel-existing': {
      if: "!contains(github.event.head_commit.message, '[skip ci]')",
      'runs-on': 'ubuntu-latest',
      steps: cancelExistingSteps,
    },
    release: {
      if: "github.ref == 'refs/heads/master'",
      needs: 'test',
      'runs-on': 'ubuntu-latest',
      steps: [
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
        { run: 'yarn clean' },
        { run: 'yarn lint' },
        ...releaseSteps,
      ],
    },
    test: {
      needs: 'cancel-existing',
      'runs-on': '${{ matrix.os }}',
      steps: [
        { uses: 'actions/checkout@v2' },
        {
          uses: 'actions/setup-node@v1',
          with: {
            'node-version': '${{ matrix.node }}',
          },
        },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'yarn --frozen-lockfile' },
        ...testSteps,
        {
          if: "matrix.os == 'ubuntu-latest' && matrix.node == 12",
          uses: 'coverallsapp/github-action@master',
          with: {
            'github-token': '${{ secrets.GITHUB_TOKEN }}',
          },
        },
      ],
      strategy: {
        matrix: {
          exclude: [
            { node: 10, os: 'macos-latest' },
            { node: 10, os: 'windows-latest' },
          ],
          node: [10, 12],
          os: ['macos-latest', 'windows-latest', 'ubuntu-latest'],
        },
      },
    },
  },
  name: 'build',
  on: {
    push: {
      branches: ['**'],
    },
  },
}
