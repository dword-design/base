import type { Base } from '@/src';

import jobMatrixStrategy from './strategies/job-matrix';
import simpleStrategy from './strategies/simple';

export default (base: Base) => {
  const environments = [
    ...base.config.supportedNodeVersions.map(version => ({
      node: version,
      os: 'ubuntu-latest',
    })),
    ...(base.config.macos
      ? [{ node: base.config.nodeVersion, os: 'macos-latest' }]
      : []),
    ...(base.config.windows
      ? [{ node: base.config.nodeVersion, os: 'windows-latest' }]
      : []),
  ];

  return {
    concurrency: {
      'cancel-in-progress': true,
      group: '${{ github.workflow }}-${{ github.ref }}',
    },
    jobs:
      environments.length > 1 && !base.config.testInContainer
        ? jobMatrixStrategy(base, environments)
        : simpleStrategy(base),
    name: 'build',
    on: { pull_request: {}, push: { branches: ['master'] } },
    permissions: {
      /**
       * See https://github.com/semantic-release/github?tab=readme-ov-file#github-authentication
       * When using the GITHUB_TOKEN, the minimum required permissions are:
       * * contents: write to be able to publish a GitHub release
       * * issues: write to be able to comment on released issues
       * * pull-requests: write to be able to comment on released pull requests
       */
      contents: 'write',
      'id-token': 'write', // For npm trusted publishing
      issues: 'write',
      'pull-requests': 'write',
    },
  };
};
