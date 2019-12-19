import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import filesConfig from '../files.config'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    test: {
      'foo.test.js': 'export default () => {}',
      'bar.test.js': 'export default () => {}',
    },
  })
  await spawn('base', ['build'])
  const { stdout } = await spawn('base', ['test', 'foo.test.js'], { capture: ['stdout'] })
  expect(stdout).toMatch(/^Copying config files …\nSuccessfully compiled 1 file with Babel.\nNo depcheck issue\n\n\n  ✓ foo\n\n  1 passing.*?\n\n----------|----------|----------|----------|----------|-------------------|\nFile      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |\n----------|----------|----------|----------|----------|-------------------|\nAll files |        0 |        0 |        0 |        0 |                   |\n----------|----------|----------|----------|----------|-------------------|\n$/)
})
