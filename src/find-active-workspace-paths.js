const { exec } = require('child-process-promise')
const { chain } = require('lodash')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const findConfig = require('./find-config')
const babelRegister = require('@babel/register')

module.exports = ({ includeRoot } = {}) => {

  babelRegister({
    configFile: path.resolve(__dirname, 'babel.config.js'),
    ignore: [/node_modules/],
  })

  return Promise.all([readPkgUp(), findConfig()])
    .then(([{ package: { workspaces }, path: packageJsonPath }, { activeWorkspaces }]) => {
      const packagePath = path.dirname(packageJsonPath)
      return workspaces !== undefined
        ? exec('yarn workspaces info --json')
          .then(({ stdout }) => JSON.parse(stdout))
          .then(({ data }) => JSON.parse(data))
          .then(workspaces => [
            ...includeRoot ? [packagePath] : [],
            ...chain(workspaces)
              .mapValues('location')
              .pickBy((_, workspaceName) => activeWorkspaces.includes(workspaceName))
              .mapValues(workspacePath => path.resolve(packagePath, workspacePath))
              .values()
              .value()
          ])
        : [process.cwd()]
    })
  }
