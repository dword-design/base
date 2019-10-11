const withLocalTmpDir = require('with-local-tmp-dir')
const mockStdio = require('mock-stdio')
const expect = require('expect')

const constantOrFunction = (func, defaultValue) => typeof func === 'function'
  ? func
  : () => func !== undefined ? func : defaultValue

module.exports = async params => {
  const callback = typeof params === 'function' ? params : params.callback
  const getLogOutput = constantOrFunction(typeof params === 'function' ? undefined : params.logOutput, '')
  const getErrOutput = constantOrFunction(typeof params === 'function' ? undefined : params.errOutput, '')

  for (const log of [true, false]) {
    await withLocalTmpDir(async () => {
      mockStdio.start()
      await callback(log)
      const { stdout, stderr } = mockStdio.end()
      const logOutput = log ? getLogOutput() : ''
      const errOutput = log ? getErrOutput() : ''
      expect(stdout)[typeof logOutput === 'string' ? 'toEqual' : 'toMatch'](logOutput)
      expect(stderr)[typeof errOutput === 'string' ? 'toEqual' : 'toMatch'](errOutput)
    })
  }
}
