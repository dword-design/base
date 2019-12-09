import outputFiles from 'output-files'
import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    test: {
      'foo.test.js': 'export default () => {}',
      'bar.test.js': 'export default () => {}',
    },
  })
  const { stdout } = await spawn('base', ['test', 'foo.test.js'], { capture: ['stdout'] })
  expect(stdout).toMatch(/^Copying config files …\nSuccessfully compiled 1 file with Babel.\nNo depcheck issue\n\n\n  ✓ foo\n\n  1 passing.*?\n\n----------|----------|----------|----------|----------|-------------------|\nFile      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |\n----------|----------|----------|----------|----------|-------------------|\nAll files |        0 |        0 |        0 |        0 |                   |\n----------|----------|----------|----------|----------|-------------------|\n$/)
})

export const timeout = 20000
