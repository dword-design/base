#!/usr/bin/env node

const { spawn, fork } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const findRootPath = require('./find-root-path')
const findActiveWorkspacePaths = require('./find-active-workspace-paths')
const readPkgUp = require('read-pkg-up')
const { forIn, chain, some, find } = require('lodash')
const findBasePath = require('./find-base-path')
const getType = require('./get-type')
const { variables } = require('./variables')
const nodeEnv = require('@dword-design/node-env')

const variablesJson = JSON.stringify(variables)

Promise.all([readPkgUp(), findBasePath()])
  .then(([{ package: packageConfig = {} }, basePath]) => {
    const globalCommands = [
      {
        name: '$0',
        desc: 'Installs dependencies, copies config files and registers git hooks',
        handler: ({ _ }) => _.length == 0
          ? Promise.resolve()
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
              ...nodeEnv === 'development'
                ? [
                  fs.exists(path.join(rootPath, '.git'))
                    .then(gitExists => gitExists
                      ?  fs.outputFile(
                        path.resolve(rootPath, '.git/hooks/pre-commit'),
                        `exec "${__filename}" pre-commit`,
                        { encoding: 'utf8', mode: '755' },
                      )
                      : undefined
                    )
                ]
                : []
            ]))
          : undefined,
      },
      {
        name: 'build',
        desc: 'Builds the current workspace',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => fork(
                path.resolve(basePath, 'src/run-workspace-command.js'),
                ['build'],
                { stdio: 'inherit', cwd: workspacePath, env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: variablesJson } },
              ))
          )),
      },
      {
        name: 'start',
        desc: 'Starts the current workspace',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => fork(
                path.resolve(basePath, 'src/run-workspace-command.js'),
                ['start'],
                { stdio: 'inherit', cwd: workspacePath, env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: variablesJson } },
              ))
          )),
      },
      ...nodeEnv === 'development'
        ? [
          {
            name: 'init',
            desc: 'Init a directory to be based',
            handler: yargs => spawn('yarn', ['init', ...yargs.y ? ['-y'] : []], { stdio: 'inherit'})
              .then(() => find(globalCommands, { name: '$0' }).handler(yargs)),
          },
          {
            name: 'add [args..]',
            desc: 'Add dependencies',
            handler: ({ args, W }) => spawn('yarn', ['add', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
          },
          {
            name: 'upgrade [args..]',
            desc: 'Upgrade dependencies',
            handler: ({ args, W }) => spawn('yarn', ['upgrade', ...args || [], ...W ? ['-W'] : []], { stdio: 'inherit'}),
          },
          {
            name: 'remove [args..]',
            desc: 'Remove dependencies',
            handler: ({ args, W }) => spawn('yarn', ['remove', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
          },
          {
            name: 'outdated',
            desc: 'Lists outdated dependencies',
            handler: () => spawn('yarn', ['outdated'], { stdio: 'inherit' }),
          },
          {
            name: 'lint',
            desc: 'Outputs linting errors',
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
            name: 'lint-staged',
            desc: 'Outputs linting errors for staged files',
            handler: () => spawn(
              path.resolve(basePath, 'node_modules/.bin/lint-staged'),
              ['.', '--config', path.resolve(basePath, 'src/lint-staged.config.js')],
              { stdio: 'inherit' },
            ),
          },
          {
            name: 'depgraph',
            desc: 'Outputs a dependency graph for the current workspace',
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
            name: 'depcheck',
            desc: 'Outputs unused dependencies',
            handler: () => findActiveWorkspacePaths({ includeRoot: true })
              .then(activeWorkspacePaths => Promise.all(
                activeWorkspacePaths.map(workspacePath =>
                  fork(path.resolve(basePath, 'src/depcheck.js'), { cwd: workspacePath })
                    .then(() => console.log())
                )
              )),
          },
          {
            name: 'pre-commit',
            desc: 'Runs commands before committing',
            handler: yargs => Promise.resolve()
              .then(() => find(globalCommands, { name: 'lint-staged' }).handler(yargs))
              .then(() => find(globalCommands, { name: 'depcheck' }).handler(yargs))
          },
        ]
        : [],
    ]

    forIn(
      [
        ...globalCommands,
        ...packageConfig !== undefined
          ? (() => {
            const type = getType(packageConfig.typeName || 'lib')
            return chain(type.commands)
              .filter(({ name }) => !some(globalCommands, { name }))
              .map(command => ({
                ...command,
                handler: () => fork(
                  path.resolve(basePath, 'src/run-workspace-command.js'),
                  [command.name],
                  { stdio: 'inherit', env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: variablesJson } }
                ),
              }))
              .value()
          })()
          : [],
      ],
      command => yargs.command(
        {
          ...command,
          command: command.name,
          handler: (...args) => command.handler(...args)
            .catch(error => {
              if (error.name === 'ChildProcessError') {
                process.exit(error.code)
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
