import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'src/index.js': 'export default 1',
    test: {
      'foo.test.js': 'export default () => {}',
      'bar.test.js': 'export default () => {}',
    },
  })
  await spawn('base', ['prepare'])
  const { stdout } = await spawn('base', ['test', 'foo.test.js'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^

      ✓ foo

      1 passing \\(.*?\\)
  `))
})
