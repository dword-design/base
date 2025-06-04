import gitHubAction from 'tagged-template-noop';

export default [
  {
    env: { GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
    uses: gitHubAction`rokroskar/workflow-run-cleanup-action@v0.3.3`,
  },
];
