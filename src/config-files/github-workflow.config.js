import ci from '@dword-design/ci/package.json'
import { first, keys, map, zipObject } from '@dword-design/functions'
import { constantCase } from 'constant-case'
import findUp from 'find-up'

import config from '@/src/config'

const bin = ci.bin |> keys |> first
const envSchemaPath = findUp.sync('.env.schema.json')
const envVariableNames =
  (envSchemaPath ? require(envSchemaPath) : {}) |> keys |> map(constantCase)

export default {
  name: 'build',
  on: {
    push: {
      branches: ['**'],
    },
  },
  jobs: {
    'cancel-existing': {
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          uses: 'rokroskar/workflow-run-cleanup-action@v0.2.2',
          env: { GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
        },
      ],
    },
    test: {
      needs: 'cancel-existing',
      ...(config.useJobMatrix && {
        strategy: {
          matrix: {
            os: ['macos-latest', 'windows-latest', 'ubuntu-latest'],
            node: [10, 12],
            exclude: [
              { os: 'macos-latest', node: 10 },
              { os: 'windows-latest', node: 10 },
            ],
          },
        },
      }),
      'runs-on': config.useJobMatrix ? '${{ matrix.os }}' : 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v2' },
        {
          uses: 'actions/setup-node@v1',
          with: {
            'node-version': config.useJobMatrix ? '${{ matrix.node }}' : 12,
          },
        },
        { run: 'git config --global user.email "actions@github.com"' },
        { run: 'git config --global user.name "GitHub Actions"' },
        { run: 'yarn --frozen-lockfile' },
        {
          run: 'yarn test',
          ...(envVariableNames.length > 0
            ? {
                env: zipObject(
                  envVariableNames,
                  envVariableNames |> map(name => `\${{ secrets.${name} }}`)
                ),
              }
            : {}),
        },
        {
          name: 'Coveralls',
          ...(config.useJobMatrix && {
            if: "matrix.os == 'ubuntu-latest' && matrix.node == 12",
          }),
          run: `yarn ${bin} coveralls`,
          env: {
            COVERALLS_REPO_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            COVERALLS_SERVICE_NAME: 'github',
            COVERALLS_GIT_COMMIT: '${{ github.sha }}',
            COVERALLS_GIT_BRANCH: '${{ github.ref }}',
          },
        },
      ],
    },
    release: {
      needs: 'test',
      if: "github.ref == 'refs/heads/master'",
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
        { run: 'yarn lint' },
        {
          name: 'Push changed files',
          run: `yarn ${bin} push-changed-files`,
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
          },
        },
        {
          name: 'Release',
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            ...(config.npmPublish
              ? { NPM_TOKEN: '${{ secrets.NPM_TOKEN }}' }
              : {}),
            ...config.deployEnv,
          },
          run: 'yarn semantic-release',
        },
      ],
    },
  },
}
