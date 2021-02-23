import self from './simple'

export default {
  works: () =>
    expect(self).toEqual({
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
    }),
}
