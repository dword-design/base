#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const mustache = require('mustache')
const { identity } = require('lodash')
const findRootPath = require('./find-root-path')
const readPkgUp = require('read-pkg-up')

mustache.escape = identity

Promise.all([
  readPkgUp({ cwd: __dirname }),
  readPkgUp(),
  findRootPath(),
])
  .then(([{ path: packageFilePath }, { package: { type = 'lib' } = {} } = {}, rootPath]) =>
    ({ packagePath: path.dirname(packageFilePath), type, rootPath })
  )
  .then(({ packagePath, type, rootPath }) => {

    const postinstall = () => Promise.all([
      fs.copyFile(path.resolve(__dirname, 'editorconfig'), path.resolve(rootPath, '.editorconfig')),
      fs.exists(path.resolve(rootPath, '.base.gitignore'))
        .then(baseGitignoreExists => [
          path.resolve(__dirname, 'gitignore'),
          ...baseGitignoreExists ? [path.resolve(rootPath, '.base.gitignore')] : [],
        ])
        .then(filePaths => Promise.all(filePaths.map(filePath => fs.readFile(filePath))))
        .then(parts => fs.outputFile(path.resolve(rootPath, '.gitignore'), parts.join('\r\n'), 'utf8')),
      fs.exists(path.join(rootPath, '.git'))
        .then(gitExists => gitExists && fs.outputFile(
          path.resolve(rootPath, '.git/hooks/pre-commit'),
          `exec "${require.resolve('lint-staged')}" --config "${path.resolve(__dirname, 'lint-staged.config.js')}"`,
          { encoding: 'utf8', mode: '755' },
        ))
    ])

    const build = () => spawn(
      path.resolve(__dirname, '../node_modules/.bin/webpack'),
      ['--config', path.resolve(packagePath, `src/webpack.${type}.config.js`)],
      { stdio: 'inherit' },
    )

    yargs
      .command({
        command: '$0',
        handler: ({ _ }) => _.length == 0
          && spawn('yarn', { stdio: 'inherit'})
            .then(postinstall),
      })

      .command({
        command: 'init',
        handler: ({ y }) => spawn('yarn', ['init', ...y ? ['-y'] : []], { stdio: 'inherit'}).catch(() => {}),
      })

      .command({
        command: 'add [args..]',
        handler: ({ args, W }) => {
          spawn('yarn', ['add', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'})
          .catch(() => {}) },
      })

      .command({
        command: 'upgrade [args..]',
        handler: ({ args, W }) => spawn('yarn', ['upgrade', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}).catch(() => {}),
      })

      .command({
        command: 'remove [args..]',
        handler: ({ args, W }) => spawn('yarn', ['remove', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}).catch(() => {}),
      })

      .command({
        command: 'outdated',
        handler: () => spawn('yarn', ['outdated'], { stdio: 'inherit'}).catch(() => {}),
      })

      .command({
        command: 'lint',
        handler: () => spawn(
          path.resolve(__dirname, '../node_modules/.bin/eslint'),
          ['.', '--config', path.resolve(packagePath, 'src/eslintrc.js'), '--ignore-path', path.resolve(packagePath, 'src/gitignore')],
          { stdio: 'inherit' },
        )
          .catch(() => {}),
      })

      .command({
        command: 'lint-staged',
        handler: () => spawn(
          path.resolve(__dirname, '../node_modules/.bin/lint-staged'),
          ['.', '--config', path.resolve(packagePath, 'src/lint-staged.config.js')],
          { stdio: 'inherit' },
        )
          .catch(() => {}),
      })

      .command({
        command: 'build',
        handler: () => build().catch(() => {}),
      })

      .command({
        command: 'start',
        handler: () => {
          const { cmd, params } = {
            lib: {
              cmd: path.resolve(__dirname, '../node_modules/.bin/webpack'),
              params: ['--watch', '--config', path.resolve(packagePath, 'src/webpack.lib.start.config.js')],
            },
            web: {
              cmd: path.resolve(__dirname, '../node_modules/.bin/webpack-dev-server'),
              params: ['--config', path.resolve(packagePath, 'src/webpack.web.config.js')],
            }
          }[type]
          return spawn(cmd, params, { stdio: 'inherit' })
            .catch(() => {})
        },
      })

    if (type == 'lib') {
      yargs
        .command({
          command: 'publish',
          handler: () => build()
            .then(() => spawn('yarn', ['publish', '--access', 'public'], { stdio: 'inherit'}))
            .catch(() => {}),
        })
    }

    return yargs
      .argv
  })
