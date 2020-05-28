import { keys, first, map, zipObject, endent } from '@dword-design/functions'
import ci from '@dword-design/ci/package.json'
import findUp from 'find-up'
import { constantCase } from 'constant-case'
import packageConfig from '../package-config'
import config from '../config'

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
      'runs-on': '${{ matrix.os }}',
      steps: [
        {
          if:
            "!github.event.repository.private || (matrix.os == 'ubuntu-latest' && matrix.node == 12)",
          uses: 'actions/checkout@v2',
        },
        {
          if:
            "!github.event.repository.private || (matrix.os == 'ubuntu-latest' && matrix.node == 12)",
          uses: 'actions/setup-node@v1',
          with: {
            'node-version': '${{ matrix.node }}',
          },
        },
        {
          if:
            "!github.event.repository.private || (matrix.os == 'ubuntu-latest' && matrix.node == 12)",
          run: endent`
            git config --global user.email "actions@github.com"
            git config --global user.name "GitHub Actions"
            yarn --frozen-lockfile
          `,
        },
        {
          if:
            "!github.event.repository.private || (matrix.os == 'ubuntu-latest' && matrix.node == 12)",
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
          name: 'Push changed files',
          run: `yarn ${bin} push-changed-files`,
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            GITHUB_REPOSITORY: '${{ secrets.GITHUB_REPOSITORY }}',
          },
        },
        {
          name: 'Coveralls',
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
        { uses: 'actions/checkout@v2', with: { 'fetch-depth': 0 } },
        {
          uses: 'actions/setup-node@v1',
          with: {
            'node-version': 12,
          },
        },
        { run: 'yarn --frozen-lockfile' },
        {
          name: 'Release',
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
            ...(config.npmPublish
              ? { NPM_TOKEN: '${{ secrets.NPM_TOKEN }}' }
              : {}),
            ...packageConfig.deployEnv,
          },
          run: 'yarn semantic-release',
        },
      ],
    },
  },
}
