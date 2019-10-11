const { register } = require('this')
const expect = require('expect')
const { readFile, mkdir, exists, outputFile } = require('fs-extra')
const { spawn } = require('child-process-promise')
const endent = require('endent')
const testWithLogging = require('./test-with-logging')

describe('register', () => {

  describe('git hook', () => {

    it('no git does nothing', () => testWithLogging({
      callback: async log => {
        await register({ log })
        expect(await exists('.git')).toBeFalsy()
      },
      logOutput: 'Copying files …\n',
    }))

    it('adds git hook', async () => testWithLogging({
      callback: async log => {
        await spawn('git', ['init'])
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
        await outputFile('.git/hooks/pre-commit', endent`
          # base
          foo bar
        `)
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
        await outputFile('.git/hooks/pre-commit', 'echo "foo bar"')
        await register({ log })
        expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual('echo "foo bar"')
      },
      logOutput: 'Copying files …\n',
    }))
  })

  describe('copy files', () => {

    describe('gitignore', () => {

      it('copies gitignore', () => testWithLogging({
        callback: async log => {
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
          await outputFile('.base.gitignore', 'foo\nbar')
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
})

