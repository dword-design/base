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
      '.DS_Store': '',
      'a/src/index.js': 'export default 1',
    },
  })
  await spawn('base', ['build'])
})
