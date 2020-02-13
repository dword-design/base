import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import { spawn } from 'child-process-promise'
import { includes } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'src/index.js': 'export default 1',
    'test/foo.test.js': '',
    'foo.txt': '',
  })
  await spawn('base', ['prepare'])
  expect(glob('*', { dot: true }) |> await |> includes('foo.txt')).toBeFalsy()
})
