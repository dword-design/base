const { exec } = require('child-process-promise')
const _ = require('lodash')
const findUp = require('find-up')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const fs = require('fs-extra')

module.exports = () => readPkgUp()
  .then(({ package: { workspaces }, path: packageJsonPath }) => workspaces !== undefined
    ? (() => {
      const packagePath = path.dirname(packageJsonPath)
      const activeWorkspacesPath = path.resolve(packagePath, 'active-workspaces.base.js')
      return Promise.all([
        exec('yarn workspaces info --json')
          .then(({ stdout }) => JSON.parse(stdout))
          .then(({ data }) => JSON.parse(data)),
        fs.exists(activeWorkspacesPath),
      ])
        .then(([workspaces, activeWorkspacesExists]) => _(workspaces)
          .mapValues('location')
          .pickBy((_, workspaceName) => activeWorkspacesExists
            ? require(activeWorkspacesPath).includes(workspaceName)
            : true
          )
          .mapValues(workspacePath => path.resolve(packagePath, workspacePath))
          .values()
          .value()
        )
    })()
    : [process.cwd()]
  )
