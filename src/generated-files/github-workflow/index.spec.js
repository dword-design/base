import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => () => {
  const self = proxyquire('.', {
    '../../config': {
      useJobMatrix: config.useJobMatrix,
    },
  })
  expect(self).toEqual(config.result)
}

export default {
  'job matrix': {
    result: {
      jobs: {
        'cancel-existing': {
          if: "!contains(github.event.head_commit.message, '[skip ci]')",
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              env: {
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
              },
              uses: 'rokroskar/workflow-run-cleanup-action@v0.3.0',
            },
          ],
        },
        release: {
          needs: 'test',
          'runs-on': 'ubuntu-latest',
          steps: [
            { uses: 'actions/checkout@v2' },
            {
              uses: 'actions/setup-node@v2',
              with: {
                'node-version': 12,
              },
            },
            { run: 'git config --global user.email "actions@github.com"' },
            { run: 'git config --global user.name "GitHub Actions"' },
            { run: 'yarn --frozen-lockfile' },
            { run: 'yarn lint' },
            {
              env: {
                GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
              },
              name: 'Push changed files',
              run: 'yarn dw-ci push-changed-files',
            },
            {
              env: {
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
                NPM_TOKEN: '${{ secrets.NPM_TOKEN }}',
              },
              if: "github.ref == 'refs/heads/master'",
              name: 'Release',
              run: 'yarn semantic-release',
            },
          ],
        },
        test: {
          needs: 'cancel-existing',
          'runs-on': '${{ matrix.os }}',
          steps: [
            { uses: 'actions/checkout@v2' },
            {
              uses: 'actions/setup-node@v2',
              with: {
                'node-version': '${{ matrix.node }}',
              },
            },
            { run: 'yarn --frozen-lockfile' },
            { run: 'yarn lint' },
            { run: 'yarn test' },
            { run: 'yarn check-unknown-files' },
            {
              env: {
                COVERALLS_GIT_BRANCH: '${{ github.ref }}',
                COVERALLS_GIT_COMMIT: '${{ github.sha }}',
                COVERALLS_REPO_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
                COVERALLS_SERVICE_NAME: 'github',
              },
              if: "matrix.os == 'ubuntu-latest' && matrix.node == 12",
              name: 'Coveralls',
              run: 'yarn dw-ci coveralls',
            },
          ],
          strategy: {
            matrix: {
              exclude: [
                {
                  node: 10,
                  os: 'macos-latest',
                },
                {
                  node: 10,
                  os: 'windows-latest',
                },
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
    },
    useJobMatrix: true,
  },
  'no job matrix': {
    result: {
      jobs: {
        build: {
          if: "!contains(github.event.head_commit.message, '[skip ci]')",
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              env: {
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
              },
              uses: 'rokroskar/workflow-run-cleanup-action@v0.3.0',
            },
            { uses: 'actions/checkout@v2' },
            {
              uses: 'actions/setup-node@v2',
              with: {
                'node-version': 12,
              },
            },
            { run: 'git config --global user.email "actions@github.com"' },
            { run: 'git config --global user.name "GitHub Actions"' },
            { run: 'yarn --frozen-lockfile' },
            { run: 'yarn lint' },
            { run: 'yarn test' },
            { run: 'yarn check-unknown-files' },
            {
              env: {
                GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
              },
              name: 'Push changed files',
              run: 'yarn dw-ci push-changed-files',
            },
            {
              env: {
                GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
                NPM_TOKEN: '${{ secrets.NPM_TOKEN }}',
              },
              if: "github.ref == 'refs/heads/master'",
              name: 'Release',
              run: 'yarn semantic-release',
            },
          ],
        },
      },
      name: 'build',
      on: {
        push: {
          branches: ['**'],
        },
      },
    },
  },
} |> mapValues(runTest)