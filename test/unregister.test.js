const { unregister } = require('this')
const { spawn } = require('child-process-promise')
const expect = require('expect')
const emptyDir = require('empty-dir')
const { outputFile, readFile, exists } = require('fs-extra')
const endent = require('endent')
const testWithLogging = require('./test-with-logging')

describe('unregister', () => {

  describe('git hook', () => {

    it('no git repository > do nothing', () => testWithLogging(async log => {
      await unregister({ log })
      expect(await emptyDir('.')).toBeTruthy()
    }))

    it('hook not from base > do nothing', () => testWithLogging(async log => {
      await spawn('git', ['init'])
      await outputFile('.git/hooks/pre-commit', 'foo bar')
      await unregister({ log })
      expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual('foo bar')
    }))

    it('hook from base > remove', () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFile('.git/hooks/pre-commit', endent`
          # base
          foo bar
        `)
        expect(await exists('.git/hooks/pre-commit')).toBeTruthy()
        await unregister({ log })
        expect(!await exists('.git/hooks/pre-commit')).toBeTruthy()
      },
      logOutput: 'Unregistering git hooks …\n',
    }))
  })
})

