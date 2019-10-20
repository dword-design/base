const outputFiles = require('output-files')
const { depcheck } = require('@dword-design/base')
const expect = require('expect')
const testWithLogging = require('./test-with-logging')
const chalk = require('chalk')

describe('depcheck', () => {

  it('no unused dependencies', () => testWithLogging(async log => {
    await outputFiles('.', {
      src: {
        'index.js': "require('change-case')",
      },
      'package.json': JSON.stringify({
        dependencies: {
          'change-case': '0.1.0',
        },
      }),
    })
    await depcheck({ log })
  }))

  it('unused dependencies', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'change-case': '0.1.0',
          },
        }),
      })
      await depcheck({ log })
    },
    logOutput: `${chalk.green('dependencies: ')}\n  ${chalk.green('- ')}change-case\n`,
  }))
})
