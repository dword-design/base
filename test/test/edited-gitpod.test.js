import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalProjectConfig } from '@dword-design/base'
import { outputFile } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(minimalProjectConfig)
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])
  await outputFile('.gitpod.yml', 'foo')
  let stderr
  try {
    await spawn(
      resolveBin.sync('@dword-design/base', { executable: 'base' }),
      ['test'],
      { capture: ['stderr'] }
    )
  } catch (error) {
    stderr = error.stderr
  }
  expect(stderr).toEqual('.gitpod.yml file must be generated. Maybe it has been accidentally modified.\n')
})

export const timeout = 20000
