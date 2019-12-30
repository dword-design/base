import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'

export default () => withLocalTmpDir(__dirname, async () => {
  const childProcess = spawn('base', ['depgraph'], { stdio: ['ignore', 'pipe', 'ignore'] })
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
  childProcess.stdout.removeAllListeners('data')
  childProcess.stdout.destroy()
  childProcess.kill()
})
