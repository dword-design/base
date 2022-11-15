export default [
  {
    uses: 'codecov/codecov-action@v3',
    with: {
      token: '${{ secrets.CODECOV_TOKEN }}',
    },
  },
]
