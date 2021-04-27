import config from '@/src/config'

export default {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: 'actions/checkout@v2' },
        {
          uses: 'micnncim/action-label-syncer@v1',
          env: {
            GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}',
          },
          with: {
            manifest: '.github/labels.yml',
          },
        },
      ],
    },
  },
  name: 'sync-labels',
  on: {
    pull_request: {},
  },
}
