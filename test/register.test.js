const { register } = require('@dword-design/base')
const expect = require('expect')
const { readFile, mkdir, exists } = require('fs-extra')
const outputFiles = require('output-files')
const { spawn } = require('child-process-promise')
const endent = require('endent')
const testWithLogging = require('./test-with-logging')
const { join } = require('path')
const emptyDir = require('empty-dir')

describe('register', () => {

  describe('git hook', () => {

    it('no git does nothing', () => testWithLogging({
      callback: async log => {
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
          }),
        })
        await register({ log })
        expect(await exists('.git')).toBeFalsy()
      },
      logOutput: 'Copying files …\n',
    }))

    it('adds git hook', async () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
          }),
        })
        await register({ log })
        expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual(endent`
          # base
          exec npx base pre-commit
        `)
      },
      logOutput: 'Registering git hooks …\nCopying files …\n',
    }))

    it('replace existing base git hook', () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
          }),
          '.git/hooks/pre-commit': endent`
            # base
            foo bar
          `
        })
        await register({ log })
        expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual(endent`
          # base
          exec npx base pre-commit
        `)
      },
      logOutput: 'Registering git hooks …\nCopying files …\n',
    }))

    it('do not add git hook if another already exists', () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
          }),
          '.git/hooks/pre-commit': 'echo "foo bar"',
        })
        await register({ log })
        expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual('echo "foo bar"')
      },
      logOutput: 'Copying files …\n',
    }))

    it('git hook run fails', () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
            dependencies: {
              'base-lang-standard': '0.1.0',
            },
          }),
          src: {
            'index.js': "console.log('foo');",
          },
          node_modules: {
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
        await register({ log })
        await spawn('git', ['add', join('src', 'index.js')])
        let hasThrown = false
        try {
          await spawn('git', ['commit', '-m', 'test'], { capture: log ? ['stderr'] : undefined })
        } catch ({ stderr }) {
          if (log) {
            console.log(stderr)
          }
          hasThrown = true
        }
        expect(hasThrown).toBeTruthy()
      },
      logOutput: /^Registering git hooks …\nCopying files …\n\n.*\n  1:19  error  Extra semicolon  semi/,
    })).timeout(4000)

    it('git hook run passes', () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
            dependencies: {
              'base-lang-standard': '0.1.0',
            },
          }),
          src: {
            'index.js': "console.log('foo')",
          },
          node_modules: {
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
        await register({ log })
        await spawn('git', ['add', join('src', 'index.js')])
        const { stdout } = await spawn('git', ['commit', '-m', 'test'], { capture: log ? ['stdout'] : undefined })
        if (log) {
          console.log(stdout)
        }
      },
      logOutput: /^Registering git hooks …\nCopying files …\n\[master \(root-commit\) .*?\] test/,
    })).timeout(4000)
  })

  describe('copy files', () => {

    describe('gitignore', () => {

      it('copies gitignore', () => testWithLogging({
        callback: async log => {
          await outputFiles('.', {
            'package.json': JSON.stringify({
              name: 'test',
            }),
          })
          await register({ log })
          expect(await readFile('.gitignore', 'utf8')).toEqual(
            endent`
              .DS_Store
              node_modules
              dist
              .vscode
              .editorconfig\n
            `
          )
        },
        logOutput: 'Copying files …\n',
      }))

      it('adds .base.gitignore', () => testWithLogging({
        callback: async log => {
          await outputFiles('.', {
            'package.json': JSON.stringify({
              name: 'test',
            }),
            '.base.gitignore': 'foo\nbar',
          })
          await register({ log })
          expect(await readFile('.gitignore', 'utf8')).toEqual(
            endent`
              .DS_Store
              node_modules
              dist
              .vscode
              .editorconfig
              foo
              bar
            `
          )
        },
        logOutput: 'Copying files …\n'
      }))
    })

    it('copies editorconfig', () => testWithLogging({
      callback: async log => {
        await outputFiles('.', {
          'package.json': JSON.stringify({
            name: 'test',
          }),
        })
        await register({ log })
        expect(await readFile('.editorconfig', 'utf8')).toEqual(
          endent`
            # Editor configuration, see http://editorconfig.org
            root = true

            [*]
            charset = utf-8
            indent_style = space
            indent_size = 2
            insert_final_newline = true
            trim_trailing_whitespace = true

            [*.md]
            max_line_length = off
            trim_trailing_whitespace = false\n
          `
        )
      },
      logOutput: 'Copying files …\n',
    }))
  })

  it('do not run in self', () => testWithLogging(async log => {
    await outputFiles('.', {
      'package.json': JSON.stringify({
        name: '@dword-design/base',
      }),
    }),
    await register({ log })
    await expect(emptyDir(process.cwd())).toBeTruthy()
  }))
})

