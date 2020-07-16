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
  jobs: {
    'cancel-existing': {
      'runs-on': 'ubuntu-latest',
      steps: [
        {
          env: { GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
          uses: 'rokroskar/workflow-run-cleanup-action@v0.2.2',
        },
      ],
    },
    coverage: {
      needs: 'test',
      steps: {
        name: 'Coveralls',
        uses: 'coverallsapp/github-action@master',
        with: {
          'github-token': '${{ secrets.GITHUB_TOKEN }}',
        },
      },
    },
    release: {
      if: "github.ref == 'refs/heads/master'",
      needs: 'coverage',
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
        { run: 'yarn clean' },
        {
          env: {
            GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
          name: 'Push changed files',
          run: `yarn ${bin} push-changed-files`,
        },
        {
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            ...(config.npmPublish
              ? { NPM_TOKEN: '${{ secrets.NPM_TOKEN }}' }
              : {}),
            ...config.deployEnv,
          },
          name: 'Release',
          run: 'yarn semantic-release',
        },
      ],
    },
    test: {
      needs: 'cancel-existing',
      ...(config.useJobMatrix && {
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
