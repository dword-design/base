import { mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

const runTest = config => {
  config.config = { deployAssets: [], deployPlugins: [], ...config.config }
  return () => {
    const self = proxyquire('./release', {
      '../config': config.config,
    })
    expect(self).toEqual(config.result)
  }
}

export default {
  'deploy assets': {
    config: { deployAssets: [{ label: 'Foo', path: 'foo.js' }] },
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
            assets: [{ label: 'Foo', path: 'foo.js' }],
          },
        ],
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
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
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
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
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
      ],
    },
  },
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
        [
          '@semantic-release/git',
          {
            message:
              'chore: ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
          },
        ],
      ],
    },
  },
} |> mapValues(runTest)
