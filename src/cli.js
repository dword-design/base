#!/usr/bin/env node

const { spawn } = require('child-process-promise')
const path = require('path')
const yargs = require('yargs')
const fs = require('fs-extra')
const findRootPath = require('./find-root-path')
const findActiveWorkspacePaths = require('./find-active-workspace-paths')
const readPkgUp = require('read-pkg-up')
const depcheck = require('depcheck')
const _ = require('lodash')
const prettyjson = require('prettyjson')
const depcheckSassParser = require('./depcheck-sass-parser')

Promise.all([readPkgUp(), findRootPath()])
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
        { stdio: 'inherit', cwd: workspacePath },
      ))

    const build = () => findActiveWorkspacePaths()
      .then(activeWorkspacePaths => Promise.all(
        activeWorkspacePaths.map(buildWorkspace)
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

      const analyzeWorkspace = workspacePath => readPkgUp({ cwd: workspacePath })
        .then(({ package: { type = 'lib' } }) => type == 'web'
          ? spawn(
            path.resolve(__dirname, '../node_modules/.bin/webpack'),
            ['--config', path.resolve(__dirname, `webpack.web.analyze.config.js`)],
            { stdio: 'inherit', cwd: workspacePath },
          )
          : Promise.resolve()
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
          path.resolve(__dirname, '../node_modules/.bin/eslint'),
          ['.', '--config', path.resolve(__dirname, 'eslintrc.js'), '--ignore-path', path.resolve(__dirname, 'gitignore')],
          { stdio: 'inherit' },
        )
      })

      .command({
        command: 'lint-staged',
        handler: () => spawn(
          path.resolve(__dirname, '../node_modules/.bin/lint-staged'),
          ['.', '--config', path.resolve(__dirname, 'lint-staged.config.js')],
          { stdio: 'inherit' },
        )
      })

      .command({
        command: 'build',
        handler: build,
      })

      .command({
        command: 'start',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths.map(startWorkspace)
          )),
      })

      .command({
        command: 'analyze',
        handler: () => findActiveWorkspacePaths()
          .then(activeWorkspacePaths => Promise.all(
            activeWorkspacePaths.map(analyzeWorkspace)
          )),
      })

      .command({
        command: 'depgraph',
        handler: () => spawn(
          path.resolve(__dirname, '../node_modules/.bin/depcruise'),
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
            path.resolve(__dirname, '../node_modules/.bin/open-cli'),
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
        handler: () => depcheck(process.cwd(), {
            detectors: [
              depcheck.detector.importDeclaration,
              depcheck.detector.requireCallExpression,
            ],
            parsers: {
              '*.vue': depcheck.parser.vue,
              '*.js': depcheck.parser.es7,
              '*.scss': depcheckSassParser,
            }
          })
            .then(json => console.log(
              prettyjson.render(_(json)
                .omit('using')
                .omitBy(_.isEmpty)
                .value()
              )
            )),
      })

    switch (type) {
      case 'lib':
        yargs
          .command({
            command: 'publish',
            handler: () => build()
              .then(() => spawn('yarn', ['publish', '--access', 'public'], { stdio: 'inherit'}))
          })
        break;
    }

    return yargs
      .argv
  })

  //node_modules/.bin/depcruise -x \"(node_modules|^lib)\"  -T dot packages/client/src |dot -T svg > depgraph-client.svg
