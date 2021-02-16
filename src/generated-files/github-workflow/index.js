import config from '@/src/config'

import jobMatrixStrategy from './strategies/job-matrix'
import simpleStrategy from './strategies/simple'

export default {
  ...(config.useJobMatrix ? jobMatrixStrategy : simpleStrategy),
  name: 'build',
  on: {
    push: {
      branches: ['**'],
    },
  },
}
