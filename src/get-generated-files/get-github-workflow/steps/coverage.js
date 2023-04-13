import gitHubAction from 'tagged-template-noop'

export default [
  {
    uses: gitHubAction`codecov/codecov-action@v3`,
    with: {
      token: '${{ secrets.CODECOV_TOKEN }}',
    },
  },
]
