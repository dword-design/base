import Mocha from 'mocha'

const Spec = Mocha.reporters.Spec

Spec.prototype.done = (failures, fn) => {
  process.removeAllListeners('uncaughtException')
  process.on('uncaughtException', err => {
    if (err.code !== 'ECONNRESET') {
      throw err
    }
  })
  fn(failures)
}

export default Spec