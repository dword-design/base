const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const { spawn } = require('child-process-promise')
const findBasePath = require('../find-base-path')
const findConfig = require('../find-config')
const { keys, chain } = require('lodash')
const depcruise = require('dependency-cruiser').cruise

const formatters = {
  dot: {
    depcruiseOptions: {
      outputType: 'dot',
    },
    handler: (dotStructure, basePath) => console.log(dotStructure)/*Promise.resolve()
      .then(() => spawn('dot', ['-T', 'svg'], { capture: ['stdout'] })
        .progress(({ stdin }) => {
          stdin.write(dotStructure)
          stdin.end()
        })
      )
      .then(({ stdout: svgCode }) =>
        spawn(
          path.resolve(basePath, 'node_modules/.bin/open-cli'),
          ['--extension', 'html'],
        )
          .progress(({ stdin }) => {
            stdin.write(svgCode)
            stdin.end()
          })
      )*/
  },
  json: {
    handler: modules => console.log(JSON.stringify(modules)),
  },
  puml: {
    handler: modules => console.log(
      [
        '@startuml',
        ...modules.map(({ source }) => `Class "${source}"`),
        ...chain(modules)
          .flatMap(({ source, dependencies }) => dependencies.map(({ resolved: target }) => ({ source, target })))
          .map(({ source, target }) => `"${source}" --> "${target}"`),
        '@enduml',
      ]
        .join('\r\n')
    ),
  }
}

const getFormatter = formatterName => {
  const formatter = formatters[formatterName]
  if (formatter === undefined) {
    throw new Error(`A formatter with the name '${formatterName}' does not exist.`)
  }
  return formatter
}

module.exports = {
  name: 'depgraph',
  desc: 'Outputs a dependency graph for the current workspace',
  options: [
    { name: '-t, --format <formatterName>', desc: 'The output format', defaultValue: 'dot' },
  ],
  handler: ({ format: formatterName }) => Promise.all([findBasePath(), findConfig()])
    .then(([basePath, { depgraphIgnores }]) => {

      const ignores = [
        ...require('../gitignore'),
        ...keys(require('../aliases.config')),
        ...depgraphIgnores,
      ]

      const { handler, depcruiseOptions } = getFormatter(formatterName)

      return handler(
        depcruise(
          ['.'],
          {
            exclude: `(${ignores.join('|')})`,
            ...depcruiseOptions,
          }
        ).modules,
        basePath
      )
    }),
  isEnabled: nodeEnv === 'development',
}
