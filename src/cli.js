#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const mustache = require('mustache')
const { identity } = require('lodash')
const findRootPath = require('./find-root-path')
const findActiveWorkspacePaths = require('./find-active-workspace-paths')
const readPkgUp = require('read-pkg-up')

mustache.escape = identity

findRootPath()
  .then(([{ package: { type = 'lib' } = {} } = {}, rootPath]) => {

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

    const buildWorkspace = workspacePath => readPkgUp({ cwd: workspacePath })
      .then(({ package: { type = 'lib' } }) => spawn(
        path.resolve(__dirname, '../node_modules/.bin/webpack'),
        ['--config', path.resolve(__dirname, `webpack.${type}.config.js`)],
        { stdio: 'inherit', workspacePath },
      ))

    const startWorkspace = workspacePath => readPkgUp({ cwd: workspacePath })
      .then(({ package: { type = 'lib' } }) => {
        const { cmd, params } = {
          lib: {
            cmd: path.resolve(__dirname, '../node_modules/.bin/webpack'),
            params: ['--watch', '--config', path.resolve(__dirname, 'webpack.lib.start.config.js')],
          },
          web: {
            cmd: path.resolve(__dirname, '../node_modules/.bin/webpack-dev-server'),
            params: ['--config', path.resolve(__dirname, 'webpack.web.config.js')],
          }
        }[type]
        return spawn(cmd, params, { stdio: 'inherit', cwd: workspacePath })
      })

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
          ['.', '--config', path.resolve(_dirname, 'eslintrc.js'), '--ignore-path', path.resolve(__dirname, 'gitignore')],
          { stdio: 'inherit' },
        )
          .catch(() => {}),
      })

      .command({
        command: 'lint-staged',
        handler: () => spawn(
          path.resolve(__dirname, '../node_modules/.bin/lint-staged'),
          ['.', '--config', path.resolve(__dirname, 'lint-staged.config.js')],
          { stdio: 'inherit' },
        )
          .catch(() => {}),
      })

      .command({
        command: 'build',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths.map(buildWorkspace)
          ))
          .catch(() => {}),
      })

      .command({
        command: 'start',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths.map(startWorkspace)
          )),
          //.catch(() => {}),
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
