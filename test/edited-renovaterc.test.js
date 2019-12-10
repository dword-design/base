import outputFiles from 'output-files'
import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    '.renovaterc.json': 'foo',
  })
  let stderr
  try {
    await spawn('base', ['test'], { capture: ['stderr'] })
  } catch (error) {
    stderr = error.stderr
  }
  expect(stderr).toEqual('.renovaterc.json file must be generated. Maybe it has been accidentally modified.\n')
})

export const timeout = 20000
