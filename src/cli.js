#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const findRootPath = require('./find-root-path')
const findActiveWorkspacePaths = require('./find-active-workspace-paths')
const readPkgUp = require('read-pkg-up')
const depcheck = require('depcheck')
const { isEmpty, without, chain, forIn } = require('lodash')
const prettyjson = require('prettyjson')
const depcheckSassParser = require('./depcheck-sass-parser')
const findBasePath = require('./find-base-path')
const { variables } = require('./variables')
const importFrom = require('import-from')

const getType = typeName => {
  const packageName = `@dword-design/base-type-${typeName}`
  const type = importFrom(process.cwd(), packageName)
  if (type === undefined) {
    type = require(packageName)
  }
  return type
}

Promise.all([readPkgUp(), findRootPath(), findBasePath()])
  .then(([{ package: { typeName = 'lib' } = {}, path: workspacePath } = {}, rootPath, basePath]) => {

    const postinstall = () => Promise.all([
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
          path.resolve(rootPath, '.git/hooks/pre-commit'),
          `exec "${require.resolve('lint-staged')}" --config "${path.resolve(basePath, 'src/lint-staged.config.js')}"`,
          { encoding: 'utf8', mode: '755' },
        ))
    ])

    const depcheckWorkspace = workspacePath => Promise.all([
      readPkgUp({ cwd: workspacePath })
        .then(({ package: { name } }) => name),
      depcheck(workspacePath, {
        detectors: [
          depcheck.detector.importDeclaration,
          depcheck.detector.requireCallExpression,
        ],
        parsers: {
          '*.vue': depcheck.parser.vue,
          '*.js': depcheck.parser.es7,
          '*.scss': depcheckSassParser,
        },
      })
        .then(json => chain(json).omit('using').omitBy(isEmpty).value()),
    ])
      .then(([packageName, stats]) => !isEmpty(stats)
        ? `${packageName}\r\n${prettyjson.render(stats)}`
        : undefined
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
        handler: ({ y }) => spawn('yarn', ['init', ...y ? ['-y'] : []], { stdio: 'inherit'}),
      })

      .command({
        command: 'add [args..]',
        handler: ({ args, W }) => spawn('yarn', ['add', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
      })

      .command({
        command: 'upgrade [args..]',
        handler: ({ args, W }) => spawn('yarn', ['upgrade', ...args || [], ...W ? ['-W'] : []], { stdio: 'inherit'}),
      })

      .command({
        command: 'remove [args..]',
        handler: ({ args, W }) => spawn('yarn', ['remove', ...args, ...W ? ['-W'] : []], { stdio: 'inherit'}),
      })

      .command({
        command: 'outdated',
        handler: () => spawn('yarn', ['outdated'], { stdio: 'inherit' }).catch(() => {})
        ,
      })

      .command({
        command: 'lint',
        handler: () => spawn(
          path.resolve(basePath, 'node_modules/.bin/eslint'),
          ['.', '--config', path.resolve(basePath, 'src/eslintrc.js'), '--ignore-path', path.resolve(basePath, 'src/gitignore')],
          { stdio: 'inherit' },
        )
          .catch(error => {
            if (error.name !== 'ChildProcessError') {
              throw(error)
            }
          })
      })

      .command({
        command: 'lint-staged',
        handler: () => spawn(
          path.resolve(basePath, 'node_modules/.bin/lint-staged'),
          ['.', '--config', path.resolve(basepath, 'src/lint-staged.config.js')],
          { stdio: 'inherit' },
        )
      })

      .command({
        command: 'build',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => readPkgUp({ cwd: workspacePath })
                .then(({ package: { typeName = 'lib' } = {} }) => getType(typeName).build(workspacePath, { basePath, variables })
              ))
          ))
            .catch(error => {
              if (error.name !== 'ChildProcessError') {
                throw(error)
              }
            }),
      })

      .command({
        command: 'start',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths
              .map(workspacePath => readPkgUp({ cwd: workspacePath })
                .then(({ package: { typeName = 'lib' } = {} }) => getType(typeName).start(workspacePath, { basePath, variables })
              ))
          )),
      })

      .command({
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
      })

      .command({
        command: 'depcheck',
        handler: () => findActiveWorkspacePaths({ includeRoot: true })
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths.map(depcheckWorkspace)
          ))
          .then(statStrings => without(statStrings, undefined))
          .then(statStrings => statStrings.join('\r\n\r\n'))
          .then(statString => console.log(`\r\n${statString}\r\n`))
      })

    forIn(getType(typeName).commands(workspacePath, { basePath, variables }), command => yargs.command(command))

    return yargs
      .argv
  })
