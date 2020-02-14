import withLocalTmpDir from 'with-local-tmp-dir'
import depgraph from './depgraph'
import kill from 'tree-kill'
import portReady from 'port-ready'

export default {
  valid: () => withLocalTmpDir(async () => {
    const childProcess = depgraph({ log: false })
      .catch(error => {
        if (error.code !== null) {
          throw error
        }
      })
      .childProcess
    await portReady(3000)
    kill(childProcess.pid)
  }),
}
