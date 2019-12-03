import outputFiles from 'output-files'
import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import { minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles(minimalProjectConfig)
  await spawn('base', ['build'])
  await spawn('base', ['test'])
})

export const timeout = 20000
