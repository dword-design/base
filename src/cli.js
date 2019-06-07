#!/usr/bin/env node

const { spawn, fork } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const findRootPath = require('./find-root-path')
const findActiveWorkspacePaths = require('./find-active-workspace-paths')
const readPkgUp = require('read-pkg-up')
const { forIn } = require('lodash')
const findBasePath = require('./find-base-path')
const { variables } = require('./variables')
const getType = require('./get-type')

Promise.all([readPkgUp(), findBasePath()])
  .then(([{ package: { typeName = 'lib' } = {}, path: workspacePath } = {}, basePath]) => {

    const commands = [
      {
        command: '$0',
        handler: ({ _ }) => _.length == 0 && Promise.resolve()
          .then(() => spawn('yarn', { stdio: 'inherit'}))
          .then(() => findRootPath())
          .then(rootPath => Promise.all([
            fs.copyFile(path.resolve(basePath, 'src/editorconfig'), path.resolve(rootPath, '.editorconfig')),
            fs.exists(path.resolve(rootPath, '.base.gitignore'))
              .then(baseGitignoreExists => [
                path.resolve(basePath, 'src/gitignore'),
                ...baseGitignoreExists ? [path.resolve(rootPath, '.base.gitignore')] : [],
              ])
              .then(filePaths => Promise.all(filePaths.map(filePath => fs.readFile(filePath))))
              .then(parts => fs.outputFile(path.resolve(rootPath, '.gitignore'), parts.join('\r\n'), 'utf8')),
            fs.exists(path.join(rootPath, '.git'))
              .then(gitExists => gitExists && fs.outputFile(
                path.resolve(rootPath, '.git/hooks/pre-commit'), `exec "${__filename}" pre-commit`, { encoding: 'utf8', mode: '755' })
              )
          ])),
      },
      {
        command: 'init',
        handler: yargs => spawn('yarn', ['init', ...yargs.y ? ['-y'] : []], { stdio: 'inherit'})
          .then(() => find(commands, { command: '$0' }).handler(yargs)),
      },
      {
        command: 'add [args..]',
        handler: ({ args, W }) => spawn('yarn', ['add', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
      },
      {
        command: 'upgrade [args..]',
        handler: ({ args, W }) => spawn('yarn', ['upgrade', ...args || [], ...W ? ['-W'] : []], { stdio: 'inherit'}),
      },
      {
        command: 'remove [args..]',
        handler: ({ args, W }) => spawn('yarn', ['remove', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
      },
      {
        command: 'outdated',
        handler: () => spawn('yarn', ['outdated'], { stdio: 'inherit' }),
      },
      {
        command: 'lint',
        handler: () => spawn(
          path.resolve(basePath, 'node_modules/.bin/eslint'),
          [
            '.',
            '--config', path.resolve(basePath, 'src/eslintrc.js'),
            '--ignore-path', path.resolve(basePath, 'src/gitignore'),
            '--ext', '.js,.vue',
          ],
          { stdio: 'inherit' },
        ),
      },
      {
        command: 'lint-staged',
        handler: () => spawn(
          path.resolve(basePath, 'node_modules/.bin/lint-staged'),
          ['.', '--config', path.resolve(basePath, 'src/lint-staged.config.js')],
          { stdio: 'inherit' },
        ),
      },
      {
        command: 'build',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => readPkgUp({ cwd: workspacePath })
                .then(({ package: { typeName = 'lib' } }) => getType(typeName).build(workspacePath, { basePath, variables })
              ))
          )),
      },
      {
        command: 'start',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => readPkgUp({ cwd: workspacePath })
                .then(({ package: { typeName = 'lib' } }) => getType(typeName).start(workspacePath, { basePath, variables })
              ))
          )),
      },
      {
        command: 'depgraph',
        handler: () => spawn(
          path.resolve(basePath, 'node_modules/.bin/depcruise'),
          ['-x', '(node_modules|^lib)', '-T', 'dot', '.'],
          { capture: ['stdout'] },
        )
          .then(({ stdout: dotStructure }) => spawn('dot', ['-T', 'svg'], { capture: ['stdout'] })
            .progress(({ stdin }) => {
              stdin.write(dotStructure)
              stdin.end()
            })
          )
          .then(({ stdout: svgCode }) => spawn(
            path.resolve(basePath, 'node_modules/.bin/open-cli'),
            ['--extension', 'html'],
          )
            .progress(({ stdin }) => {
              stdin.write(svgCode)
              stdin.end()
            })
          )
      },
      {
        command: 'depcheck',
        handler: () => findActiveWorkspacePaths({ includeRoot: true })
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths.map(workspacePath =>
              fork(path.resolve(__dirname, 'depcheck.js'), { cwd: workspacePath })
                .then(() => console.log())
            )
          )),
      },
      {
        command: 'pre-commit',
        handler: yargs => Promise.resolve()
          .then(() => find(commands, { command: 'lint-staged' }).handler(yargs))
          .then(() => find(commands, { command: 'depcheck' }).handler(yargs))
      },
      ...getType(typeName).commands(workspacePath, { basePath, variables }),
    ]

    forIn(
      commands,
      command => yargs.command(
        {
          ...command,
          handler: (...args) => command.handler(...args)
            .catch(error => {
              if (error.name === 'ChildProcessError') {
                process.exit(1)
              } else {
                throw(error)
              }
            }),
        },
      ),
    )

    return yargs
      .argv
  })
