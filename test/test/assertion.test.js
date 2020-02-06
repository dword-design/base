import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'src/index.js': 'export default 1',
    'test/foo.test.js': 'export default () => expect(1).toEqual(2)',
  })
  await spawn('base', ['prepare'])
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Error: expect(received).toEqual(expected)')
})
