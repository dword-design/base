import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import { exists } from 'fs'
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
    await spawn('base', ['build'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Format Error: expected "  "')
  expect(await exists('dist')).toBeFalsy()
})

export const timeout = 8000
