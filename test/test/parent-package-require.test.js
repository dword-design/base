import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import filesConfig from '../files.config'
import { endent } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'test/valid.test.js': endent`
      import foo from 'foo'

      export default foo
    `,
  })
  await spawn('base', ['build'])
  await spawn('base', ['test'])
})
