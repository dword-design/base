import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(minimalProjectConfig)
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['test'])
})

export const timeout = 20000
