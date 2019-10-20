const { unregister } = require('@dword-design/base')
const { spawn } = require('child-process-promise')
const expect = require('expect')
const { readFile, exists } = require('fs-extra')
const endent = require('endent')
const testWithLogging = require('./test-with-logging')
const outputFiles = require('output-files')

describe('unregister', () => {

  describe('git hook', () => {

    it('no git repository > do nothing', () => testWithLogging(async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          name: 'test',
        }),
      })
      await unregister({ log })
      expect(await exists('.git')).toBeFalsy()
    }))

    it('hook not from base > do nothing', () => testWithLogging(async log => {
      await spawn('git', ['init'])
      await outputFiles('.', {
        'package.json': JSON.stringify({
          name: 'test',
        }),
        '.git/hooks/pre-commit': 'foo bar',
      }),
      await unregister({ log })
      expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual('foo bar')
    }))

    it('hook from base > remove', () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
          }),
          '.git/hooks/pre-commit': endent`
            # base
            foo bar
          `,
        })
        await unregister({ log })
        expect(await exists('.git/hooks/pre-commit')).toBeFalsy()
      },
      logOutput: 'Unregistering git hooks …\n',
    }))
  })

  it('do not run in self', () => testWithLogging(async log => {
    await outputFiles('.', {
      'package.json': JSON.stringify({
        name: '@dword-design/base',
      }),
      '.git/hooks/pre-commit': endent`
        # base
        foo bar
      `,
    })
    await unregister({ log })
    await expect(exists('.git/hooks/pre-commit')).toBeTruthy()
  }))
})

