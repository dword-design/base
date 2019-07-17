const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const { spawn } = require('child-process-promise')
const findBasePath = require('../find-base-path')
const findConfig = require('../find-config')
const { keys } = require('lodash')

module.exports = {
  name: 'depgraph',
  desc: 'Outputs a dependency graph for the current workspace',
  handler: () => Promise.all([findBasePath(), findConfig()])
    .then(([basePath, { depgraphIgnores }]) => {

      const ignores = [
        ...require('../gitignore'),
        ...keys(require('../aliases.config')),
        ...depgraphIgnores,
      ]

      return spawn(
        path.resolve(basePath, 'node_modules/.bin/depcruise'),
        ['-x', `(${ignores.join('|')})`, '-T', 'dot', '.'],
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
    }),
  isEnabled: nodeEnv === 'development',
}
