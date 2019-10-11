const allSettled = require('promise.allsettled')
const find = require('@dword-design/functions/find')

module.exports = promises => allSettled(promises)
  .then(results => {
    const rejected = find(results, { status: 'rejected' })
    if (rejected !== undefined) {
      throw rejected.reason
    }
  })
