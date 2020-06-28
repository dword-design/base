import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => {
  config.config = { deployPlugins: [], deployAssets: [], ...config.config }
  return () => {
    const self = proxyquire('./release.config', {
      '../config': config.config,
    })
    expect(self).toEqual(config.result)
  }
}

export default {
  valid: {
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
          '@semantic-release/npm',
          {
            npmPublish: false,
          },
        ],
        '@semantic-release/github',
        '@semantic-release/git',
      ],
    },
  },
  'npm publish': {
    config: { npmPublish: true },
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/github',
        '@semantic-release/git',
      ],
    },
  },
  'deploy plugins': {
    config: { deployPlugins: ['semantic-release-foo'] },
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
          '@semantic-release/npm',
          {
            npmPublish: false,
          },
        ],
        'semantic-release-foo',
        '@semantic-release/github',
        '@semantic-release/git',
      ],
    },
  },
  'deploy assets': {
    config: { deployAssets: [{ path: 'foo.js', label: 'Foo' }] },
    result: {
      plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        [
          '@semantic-release/npm',
          {
            npmPublish: false,
          },
        ],
        [
          '@semantic-release/github',
          {
            assets: [{ path: 'foo.js', label: 'Foo' }],
          },
        ],
        '@semantic-release/git',
      ],
    },
  },
} |> mapValues(runTest)
