export default {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v2' },
        {
          uses: 'dword-design/action-sync-node-meta@commit-message',
          with: {
            commitMessagePrefix: 'fix:',
            githubToken: '${{ secrets.GITHUB_TOKEN }}',
          },
        },
      ],
    },
  },
  name: 'sync-metadata',
  on: {
    schedule: [{ cron: '0 */6 * * *' }],
  },
}
