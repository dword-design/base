const outputFiles = require('output-files')
const endent = require('endent')
const { fork } = require('child-process-promise')
const { exists } = require('fs-extra')
const { build } = require('this')
const expect = require('expect')
const testWithLogging = require('./test-with-logging')

describe('build', () => {

  it('throws error if no target exists', () => testWithLogging(async log => {
    await outputFiles('.', {
      'package.json': JSON.stringify({
        dependencies: {
          'change-case': '0.1.0',
        },
      }),
    })
    await expect(build({ log })).rejects.toThrow()
  }))

  it('target defined', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'base-target-node': '0.1.0',
          },
        }),
        node_modules: {
          'base-target-node': {
            'index.js': endent`
              const { outputFile } = require('fs-extra')
              module.exports = { build: () => outputFile('dist/index.js', 'foo') }
            `,
          }
        }
      })
      await build({ log })
      expect(await exists('dist/index.js'))
    },
    logOutput: 'Building …\nBuild successful!\n',
  }))
})
