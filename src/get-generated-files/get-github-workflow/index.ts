import jobMatrixStrategy from './strategies/job-matrix';
import simpleStrategy from './strategies/simple';

export default function () {
  const environments = [
    ...this.config.supportedNodeVersions.map(version => ({
      node: version,
      os: 'ubuntu-latest',
    })),
    ...(this.config.macos
      ? [{ node: this.config.nodeVersion, os: 'macos-latest' }]
      : []),
    ...(this.config.windows
      ? [{ node: this.config.nodeVersion, os: 'windows-latest' }]
      : []),
  ];

  return {
    concurrency: {
      'cancel-in-progress': true,
      group: '${{ github.workflow }}-${{ github.ref }}',
    },
    jobs:
      environments.length > 1 && !this.config.testInContainer
        ? jobMatrixStrategy.call(this, environments)
        : simpleStrategy.call(this),
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
}
