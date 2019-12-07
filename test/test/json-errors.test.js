import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import expect from 'expect'
import { minimalProjectConfig } from '@dword-design/base'
import outputFiles from 'output-files'
import { endent } from '@functions'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/test.json': endent`
      {
      "foo": "bar"
      }
    `,
  })
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Format Error: expected "  "')
})

export const timeout = 8000
