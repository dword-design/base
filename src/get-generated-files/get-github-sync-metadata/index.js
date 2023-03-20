export default function () {
  return {
    jobs: {
      build: {
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v3' },
          {
            uses: 'jaid/action-sync-node-meta@v2.0.0',
            with: {
              approve: false,
              ...(!this.config.syncKeywords && { syncKeywords: false }),
              commitMessage:
                'fix: write GitHub metadata to package.json [{changes}]',
              githubToken: '${{ secrets.GITHUB_TOKEN }}',
            },
          },
          { uses: 'gautamkrishnar/keepalive-workflow@v1' },
        ],
      },
    },
    name: 'sync-metadata',
    on: {
      schedule: [{ cron: '0 5 * * *' }],
      workflow_dispatch: {},
    },
  }
}