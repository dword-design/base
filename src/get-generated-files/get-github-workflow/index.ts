import jobMatrixStrategy from './strategies/job-matrix';
import simpleStrategy from './strategies/simple';

export default function () {
  return {
    concurrency: {
      'cancel-in-progress': true,
      group: '${{ github.workflow }}-${{ github.ref }}',
    },
    jobs: (this.config.useJobMatrix && !this.config.testInContainer
      ? jobMatrixStrategy
      : simpleStrategy
    ).call(this),
    name: 'build',
    on: { pull_request: {}, push: { branches: ['master'] } },
    permissions: {
      contents: 'write', // Create GitHub releases
      'id-token': 'write', // For npm trusted publishing
    },
  };
}
