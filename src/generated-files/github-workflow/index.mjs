import config from '@/src/config.mjs'

import jobMatrixStrategy from './strategies/job-matrix.mjs'
import simpleStrategy from './strategies/simple.mjs'

export default {
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
}
