import withLocalTmpDir from 'with-local-tmp-dir'
import portReady from 'port-ready'
import axios from 'axios'
import kill from 'tree-kill-promise'
import depgraph from './depgraph'
import { property } from '@dword-design/functions'
import { outputFile } from 'fs-extra'

export default {
  valid: () => withLocalTmpDir(async () => {
    await outputFile('src/index.js', '')
    const childProcess = depgraph()
    await portReady(3000)
    expect(axios.get('http://localhost:3000') |> await |> property('data')).toMatch('Depgraph')
    await kill(childProcess.pid)
  }),
}