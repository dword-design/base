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
          with: {
            manifest: '.github/labels.yml',
          },
        },
      ],
    },
  },
  name: 'sync-labels',
  on: {
    push: {
      branches: ['master'],
    },
  },
}
