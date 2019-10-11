const withLocalTmpDir = require('with-local-tmp-dir')
const mockStdio = require('mock-stdio')
const expect = require('expect')

const constantOrFunction = (func, defaultValue) => typeof func === 'function'
  ? func
  : () => func !== undefined ? func : defaultValue

module.exports = async params => {
  const callback = typeof params === 'function' ? params : params.callback
  const logOutput = constantOrFunction(typeof params === 'function' ? undefined : params.logOutput, '')
  const errOutput = constantOrFunction(typeof params === 'function' ? undefined : params.errOutput, '')

  for (const log of [true, false]) {
    await withLocalTmpDir(async () => {
      mockStdio.start()
      await callback(log)
      const { stdout, stderr } = mockStdio.end()
      expect(JSON.stringify(stdout)).toEqual(JSON.stringify(log ? logOutput() : ''))
      //expect(stdout).toEqual(log ? logOutput() : '')
      expect(stderr).toEqual(log ? errOutput() : '')
    })
  }
}
