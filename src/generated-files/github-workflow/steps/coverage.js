import loadPkg from 'load-pkg'

const packageConfig = loadPkg.sync()

export default packageConfig.private
  ? []
  : [
    {
      uses: 'coverallsapp/github-action@master',
      with: {
        'github-token': '${{ secrets.GITHUB_TOKEN }}',
      },
    },
  ]
