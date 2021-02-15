export default [
  {
    env: { GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}' },
    uses: 'rokroskar/workflow-run-cleanup-action@v0.3.0',
  },
]
