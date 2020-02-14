import withLocalTmpDir from 'with-local-tmp-dir'
import depgraph from './depgraph'
import portReady from 'port-ready'
import kill from 'tree-kill'

export default {
  valid: () => withLocalTmpDir(async () => {
    const childProcess = depgraph({ log: false })
    await portReady(3000)
    kill(childProcess.pid)
  }),
}
