import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "workspaces": ["packages/*"]
      }

    `,
    packages: {
      'a/src/index.js': 'export default 1;',
      'b/src/index.js': 'export default "1"',
    },
  })
  const childProcess = spawn('base', ['start'], { stdio: ['ignore', 'pipe', 'ignore'] })
    .catch(error => {
      if (error.code !== null) {
        throw error
      }
    })
    .childProcess
  await Promise.all([
    new Promise(resolve => childProcess.stdout.on('data', data => {
      if (data.toString().includes('error  Extra semicolon  semi')) {
        resolve()
      }
    })),
    new Promise(resolve => childProcess.stdout.on('data', data => {
      if (data.toString().includes('error  Strings must use singlequote  quotes')) {
        resolve()
      }
    })),
  ])
  childProcess.stdout.removeAllListeners('data')
  childProcess.stdout.destroy()
  childProcess.kill()
})
