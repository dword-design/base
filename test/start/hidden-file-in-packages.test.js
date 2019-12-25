import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'
import P from 'path'
import waitForChange from 'wait-for-change'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      private: true,
      workspaces: ['packages/*'],
    }), undefined, 2),
    packages: {
      '.DS_Store': '',
      a: filesConfig,
    },
  })
  const childProcess = spawn('base', ['start'], { stdio: 'ignore' })
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  await waitForChange(P.join('packages', 'a', 'dist', 'index.js'))
  childProcess.kill()
})
