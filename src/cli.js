#!/usr/bin/env node

const { spawn, fork } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const findRootPath = require('./find-root-path')
const findActiveWorkspacePaths = require('./find-active-workspace-paths')
const readPkgUp = require('read-pkg-up')
const { forIn, map, chain } = require('lodash')
const findBasePath = require('./find-base-path')
const getTypePath = require('./get-type-path')
const glob = require('glob')

Promise.all([readPkgUp(), findBasePath()])
  .then(([{ package: { typeName = 'lib' } = {} } = {}, basePath]) => {

    const globalCommands = [
      {
        command: '$0',
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
              fs.exists(path.join(rootPath, '.git'))
                .then(gitExists => gitExists
                  ?  fs.outputFile(
                    path.resolve(rootPath, '.git/hooks/pre-commit'),
                    `exec "${__filename}" pre-commit`,
                    { encoding: 'utf8', mode: '755' },
                  )
                  : undefined
                )
            ]))
          : undefined,
      },
      {
        command: 'init',
        desc: 'Init a directory to be based',
        handler: yargs => spawn('yarn', ['init', ...yargs.y ? ['-y'] : []], { stdio: 'inherit'})
          .then(() => find(globalCommands, { command: '$0' }).handler(yargs)),
      },
      {
        command: 'add [args..]',
        desc: 'Add dependencies',
        handler: ({ args, W }) => spawn('yarn', ['add', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
      },
      {
        command: 'upgrade [args..]',
        desc: 'Upgrade dependencies',
        handler: ({ args, W }) => spawn('yarn', ['upgrade', ...args || [], ...W ? ['-W'] : []], { stdio: 'inherit'}),
      },
      {
        command: 'remove [args..]',
        desc: 'Remove dependencies',
        handler: ({ args, W }) => spawn('yarn', ['remove', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
      },
      {
        command: 'outdated',
        desc: 'Lists outdated dependencies',
        handler: () => spawn('yarn', ['outdated'], { stdio: 'inherit' }),
      },
      {
        command: 'lint',
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
        command: 'lint-staged',
        desc: 'Outputs linting errors for staged files',
        handler: () => spawn(
          path.resolve(basePath, 'node_modules/.bin/lint-staged'),
          ['.', '--config', path.resolve(basePath, 'src/lint-staged.config.js')],
          { stdio: 'inherit' },
        ),
      },
      {
        command: 'build',
        desc: 'Builds the current workspace',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => readPkgUp({ cwd: workspacePath })
                .then(({ package: { typeName = 'lib' } }) => {
                  const typePath = getTypePath(typeName)
                  return fork(path.resolve(typePath, 'src/commands/build.js'), ['--base-path', basePath ], { stdio: 'inherit' })
                })
              )
          )),
      },
      {
        command: 'start',
        desc: 'Starts the current workspace',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => readPkgUp({ cwd: workspacePath })
                .then(({ package: { typeName = 'lib' } }) => {
                  const typePath = getTypePath(typeName)
                  return fork(path.resolve(typePath, 'src/commands/start.js'), ['--base-path', basePath, { stdio: 'inherit' } ])
                })
              )
          )),
      },
      {
        command: 'depgraph',
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
        command: 'depcheck',
        desc: 'Outputs unused dependencies',
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
        desc: 'Runs commands before committing',
        handler: yargs => Promise.resolve()
          .then(() => find(globalCommands, { command: 'lint-staged' }).handler(yargs))
          .then(() => find(globalCommands, { command: 'depcheck' }).handler(yargs))
      },
    ]

    const typePath = getTypePath(typeName)

    forIn(
      [
        ...globalCommands,
        ...chain(glob.sync(path.join(typePath, 'src/commands/*.js')))
          .map(filePath => path.parse(filePath).name)
          .without(...map(globalCommands, 'command'))
          .map(name => ({
            command: name,
            handler: () => fork(path.resolve(typePath, `src/commands/${name}.js`), ['--base-path', basePath, { stdio: 'inherit' } ]),
          }))
          .value(),
      ],
      command => yargs.command(
        {
          ...command,
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
