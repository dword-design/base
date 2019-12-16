import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { minimalPackageConfig, minimalProjectConfig, minimalWorkspaceConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'
import stealthyRequire from 'stealthy-require'
import P from 'path'
import expect from 'expect'
import { outputFile } from 'fs-extra'
import waitForChange from 'wait-for-change'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      private: true,
      workspaces: ['packages/*'],
    }), undefined, 2),
    'packages/a': minimalWorkspaceConfig,
    'packages/b': minimalWorkspaceConfig,
  })
  const childProcess = spawn('base', ['start'], { stdio: 'ignore' })
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  await Promise.all([
    waitForChange(P.join('packages', 'a', 'dist', 'index.js')),
    waitForChange(P.join('packages', 'b', 'dist', 'index.js')),
  ])
  expect(require(P.resolve('packages', 'a', 'dist'))).toEqual(1)
  expect(require(P.resolve('packages', 'b', 'dist'))).toEqual(1)
  await Promise.all([
    outputFile(P.resolve('packages', 'a', 'src', 'index.js'), 'export default 2'),
    outputFile(P.resolve('packages', 'b', 'src', 'index.js'), 'export default 2'),
  ])
  await Promise.all([
    waitForChange(P.join('packages', 'a', 'dist', 'index.js')),
    waitForChange(P.join('packages', 'b', 'dist', 'index.js')),
  ])
  expect(stealthyRequire(require.cache, () => require(P.resolve('packages', 'a', 'dist')))).toEqual(2)
  expect(stealthyRequire(require.cache, () => require(P.resolve('packages', 'b', 'dist')))).toEqual(2)
  childProcess.kill()
})

export const timeout = 20000
