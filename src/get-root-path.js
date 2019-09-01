const readPkgUp = require('read-pkg-up')
const pkgDir = require('pkg-dir')
const { resolve, dirname } = require('path')
const findYarnWorkspaceRoot = require('find-yarn-workspace-root')

module.exports = () => {
  const cwd = process.env.INIT_CWD || process.cwd()
  const workspaceRoot = findYarnWorkspaceRoot(cwd)
  return workspaceRoot !== null ? Promise.resolve(workspaceRoot) : pkgDir(cwd)
}
  /*{ console.log(process.env); return process.env.INIT_CWD !== undefined
  ? Promise.resolve(process.env.INIT_CWD)
  /*: Promise.all([readPkgUp({ cwd: process.env.PWD }), readPkgUp({ cwd: __dirname })])
    .then(
      ([
        { package: { name: packageName } = {}, path: packageJsonPath } = {},
        { package: { name: basePackageName } }
      ]) => {
        const packagePath = dirname(packageJsonPath)
        return packageName === basePackageName ? pkgDir(resolve(packagePath, '..')) : packagePath
      }
    )
    .then(packagePath => packagePath !== undefined
      ? readPkgUp({ cwd: resolve(packagePath, '..') })
        .then(({ path: parentConfigPath, package: { workspaces, private: isPrivate } = {} } = {}) =>
          workspaces !== undefined && isPrivate ? path.dirname(parentConfigPath) : packagePath
        )
      : Promise.resolve()
    )
    }
*/
