const { spawnSync } = require('child_process')
const { chain } = require('lodash')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const babelRegister = require('@babel/register')
const getBaseConfig = require('./get-base-config')
const babelConfig = require('./babel.config')

module.exports = ({ includeRoot } = {}) => {
  const { activeWorkspaces } = getBaseConfig()
  babelRegister({ ...babelConfig, ignore: [/node_modules/] })

  const { package: { workspaces: workspaceNames }, path: packageJsonPath } = readPkgUp.sync()
  const packagePath = path.dirname(packageJsonPath)
  return [
    ...includeRoot || workspaceNames === undefined ? [packagePath] : [],
    ...workspaceNames !== undefined
      ? chain(
        JSON.parse(
          JSON.parse(
            spawnSync('yarn', ['workspaces', 'info', '--json']).stdout.toString()
          ).data
        )
      )
        .mapValues('location')
        .pickBy((_, workspaceName) => activeWorkspaces.length == 0 || activeWorkspaces.includes(workspaceName))
        .mapValues(workspacePath => path.resolve(packagePath, workspacePath))
        .values()
        .value()
      : [],
  ]
}
