import jobMatrixStrategy from './strategies/job-matrix.js'
import simpleStrategy from './strategies/simple.js'

export default function () {
  return {
    jobs: (this.config.useJobMatrix && !this.config.testInContainer
      ? jobMatrixStrategy
      : simpleStrategy)(this.config),
    name: 'build',
    on: {
      pull_request: {},
      push: {
        branches: ['master'],
      },
    },
  }
}
