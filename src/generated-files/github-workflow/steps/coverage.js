export default [
  {
    uses: 'codecov/codecov-action@v2',
    with: {
      fail_ci_if_error: true,
      token: '${{ secrets.CODECOV_TOKEN }}',
    },
  },
]
