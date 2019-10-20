const outputFiles = require('output-files')
const endent = require('endent')
const { exists, readFile } = require('fs-extra')
const { build } = require('@dword-design/base')
const expect = require('expect')
const testWithLogging = require('./test-with-logging')

describe('build', () => {

  it('plugin', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'base-plugin-node': '0.1.0',
          },
        }),
        'src/index.js': "console.log('foo')",
        'node_modules/base-plugin-node': {
          'index.js': endent`
            const { copyFile } = require('fs-extra')
            module.exports = {
              build: () => copyFile('src/index.js', 'dist'),
            }
          `,
        },
      })
      await build({ log })
      expect(await exists('dist/index.js'))
    },
    logOutput: 'Building …\nBuild successful!\n',
  }))

  it('plugin with lang', () => testWithLogging({
    callback: async log => {
      await outputFiles('.', {
        'package.json': JSON.stringify({
          dependencies: {
            'base-lang-standard': '0.1.0',
            'base-plugin-node': '0.1.0',
          },
        }),
        node_modules: {
          'base-lang-standard/index.js': "module.exports = 'standard'",
          'base-plugin-node/index.js': endent`
            const { outputFile } = require('fs-extra')
            module.exports = {
              build: ({ lang }) => outputFile('dist/test.txt', lang),
            }
          `,
        },
      })
      await build({ log })
      expect(await readFile('dist/test.txt', 'utf8')).toEqual('standard')
    },
    logOutput: 'Building …\nBuild successful!\n',
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
          'base-plugin-node/index.js': endent`
            const { copyFile } = require('fs-extra')
            module.exports = {
              build: async ({ lint }) => {
                await lint()
                await copyFile('src/index.js', 'dist')
              },
            }
          `,
          'base-lang-standard/index.js': endent`
            module.exports = {
              eslintConfig: {
                "rules": {
                  "semi": ["error", "never"],
                },
              },
            }
          `,
        }
      })
      await expect(build({ log })).rejects.toThrow()
    },
    logOutput: 'Building …\n',
  }))
})
