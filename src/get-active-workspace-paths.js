const { exec } = require('child-process-promise')
const { chain } = require('lodash')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const babelRegister = require('@babel/register')
const getBaseConfig = require('./get-base-config')
const babelConfig = require('./babel.config')

module.exports = ({ includeRoot } = {}) => {
  const { activeWorkspaces } = getBaseConfig()
  babelRegister({ ...babelConfig, ignore: [/node_modules/] })

  return readPkgUp()
    .then(({ package: { workspaces }, path: packageJsonPath }) => {
      const packagePath = path.dirname(packageJsonPath)
      return workspaces !== undefined
        ? exec('yarn workspaces info --json')
          .then(({ stdout }) => JSON.parse(stdout))
          .then(({ data }) => JSON.parse(data))
          .then(workspaces => [
            ...includeRoot ? [packagePath] : [],
            ...chain(workspaces)
              .mapValues('location')
              .pickBy((_, workspaceName) => activeWorkspaces.length == 0 || activeWorkspaces.includes(workspaceName))
              .mapValues(workspacePath => path.resolve(packagePath, workspacePath))
              .values()
              .value()
          ])
        : [process.cwd()]
    })
  }
