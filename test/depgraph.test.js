import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import filesConfig from './files.config'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(filesConfig)
  const childProcess = spawn('base', ['depgraph'], { stdio: ['ignore', 'pipe', 'pipe'] })
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  await new Promise(resolve => childProcess.stdout.on('data', data => {
    if (data.toString() === 'Depgraph available at http://localhost:4000 …\n') {
      resolve()
    }
  }))
  childProcess.kill()
})
