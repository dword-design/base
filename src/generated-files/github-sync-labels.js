export default {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v2' },
        {
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
          uses: 'micnncim/action-label-syncer@v1',
        },
      ],
    },
  },
  name: 'sync-labels',
  on: {
    push: {
      branches: ['master'],
      paths: ['.github/labels.yml'],
    },
  },
}
