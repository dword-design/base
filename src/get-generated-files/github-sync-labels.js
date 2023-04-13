import gitHubAction from 'tagged-template-noop'

export default {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: gitHubAction`actions/checkout@v3` },
        {
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
          uses: gitHubAction`micnncim/action-label-syncer@v1`,
        },
      ],
    },
  },
  name: 'sync-labels',
  on: {
    push: {
      branches: ['master'],
      paths: ['.github/labels.yml', '.github/workflows/sync-labels.yml'],
    },
  },
}
