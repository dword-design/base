import jobMatrixStrategy from './strategies/job-matrix'
import simpleStrategy from './strategies/simple'

export default config => ({
  jobs: (config.useJobMatrix && !config.testInContainer
    ? jobMatrixStrategy
    : simpleStrategy)(config),
  name: 'build',
  on: {
    pull_request: {},
    push: {
      branches: ['master'],
    },
  },
})
