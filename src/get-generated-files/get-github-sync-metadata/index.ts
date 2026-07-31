import gitHubAction from 'tagged-template-noop';

import type { Base } from '@/src';

export default (base: Base) => ({
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
      steps: [
        { uses: gitHubAction`actions/checkout@v4` },
        {
          uses: gitHubAction`jaid/action-sync-node-meta@v2.0.0`,
          with: {
            approve: false,
            ...(!base.config.syncKeywords && { syncKeywords: false }),
            commitMessage:
              'fix: write GitHub metadata to package.json [{changes}]',
            githubToken: '${{ secrets.GITHUB_TOKEN }}',
          },
        },
        { uses: gitHubAction`liskin/gh-workflow-keepalive@v1` },
      ],
    },
  },
  name: 'sync-metadata',
  on: { schedule: [{ cron: '0 5 * * *' }], workflow_dispatch: {} },
});
