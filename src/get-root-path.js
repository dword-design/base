const readPkgUp = require('read-pkg-up')
const pkgDir = require('pkg-dir')
const { resolve, dirname } = require('path')
const findYarnWorkspaceRoot = require('find-yarn-workspace-root')

module.exports = () => Promise.resolve()
  .then(() => {
    const cwd = process.env.INIT_CWD || process.cwd()
    const workspaceRoot = findYarnWorkspaceRoot(cwd)
    return workspaceRoot !== null ? Promise.resolve(workspaceRoot) : pkgDir(cwd)
  })
  .then(rootPath => Promise.all([readPkgUp({ cwd: rootPath }), readPkgUp({ cwd: __dirname })])
    .then(([
      { package: { name: rootPackageName } },
      { package: { name: basePackageName } },
    ]) => rootPackageName !== basePackageName ? rootPath : undefined)
  )
