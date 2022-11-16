import packageName from 'depcheck-package-name'

export default config => ({
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    packageName`@semantic-release/changelog`,
    config.npmPublish
      ? packageName`@semantic-release/npm`
      : [packageName`@semantic-release/npm`, { npmPublish: false }],
    ...config.deployPlugins,
    config.deployAssets.length
      ? [
          packageName`@semantic-release/github`,
          {
            assets: config.deployAssets,
          },
        ]
      : packageName`@semantic-release/github`,
    [
      packageName`@semantic-release/git`,
      {
        message:
          'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
})
