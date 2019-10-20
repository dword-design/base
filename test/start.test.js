const outputFiles = require('output-files')
const endent = require('endent')
const { fork } = require('child-process-promise')
const { exists } = require('fs-extra')
const { start } = require('this')
const expect = require('expect')
const testWithLogging = require('./test-with-logging')

describe('start', () => {

  it('plugin', () => testWithLogging(async log => {
    await outputFiles('.', {
      'package.json': JSON.stringify({
        dependencies: {
          'base-plugin-node': '0.1.0',
        },
      }),
      node_modules: {
        'base-plugin-node': {
          'index.js': endent`
            const { outputFile } = require('fs-extra')
            module.exports = { start: () => outputFile('dist/index.js', 'foo') }
          `,
        }
      }
    })
    await start({ log })
    expect(await exists('dist/index.js'))
  }))

  it('plugin using lint', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'base-plugin-node': '0.1.0',
            'base-lang-standard': '0.1.0',
          },
        }),
        'src/index.js': "console.log('foo');",
        node_modules: {
          'base-plugin-node': {
            'index.js': endent`
              const { copyFile } = require('fs-extra')
              module.exports = {
                start: async ({ lint }) => {
                  await lint()
                  await copyFile('src/index.js', 'dist')
                },
              }
            `,
          },
          'base-lang-standard': {
            'index.js': endent`
              module.exports = {
                eslintConfig: {
                  "rules": {
                    "semi": ["error", "never"],
                  },
                },
              }
            `,
          }
        }
      })
      await expect(start({ log })).rejects.toThrow()
    },
  }))
})
