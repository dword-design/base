const outputFiles = require('output-files')
const endent = require('endent')
const { fork } = require('child-process-promise')
const { exists } = require('fs-extra')
const { build } = require('this')
const expect = require('expect')
const testWithLogging = require('./test-with-logging')

describe('build', () => {

  it('no target', () => testWithLogging(async log => {
    await outputFiles('.', {
      'package.json': JSON.stringify({
        dependencies: {
          'change-case': '0.1.0',
        },
      }),
    })
    await expect(build({ log })).rejects.toThrow()
  }))

  it('simple target', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'base-target-node': '0.1.0',
          },
        }),
        'src/index.js': "console.log('foo')",
        'node_modules/base-target-node': {
          'index.js': endent`
            const { copyFile } = require('fs-extra')
            module.exports = {
              build: async () => {
                await copyFile('src/index.js', 'dist')
              },
            }
          `,
        },
      })
      await build({ log })
      expect(await exists('dist/index.js'))
    },
    logOutput: 'Building …\nBuild successful!\n',
  }))

  it('target using lint', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'base-target-node': '0.1.0',
            'base-lang-standard': '0.1.0',
          },
        }),
        'src/index.js': "console.log('foo');",
        node_modules: {
          'base-target-node': {
            'index.js': endent`
              const { copyFile } = require('fs-extra')
              module.exports = {
                build: async ({ lint }) => {
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
      await expect(build({ log })).rejects.toThrow()
    },
    logOutput: 'Building …\n',
  }))
})
