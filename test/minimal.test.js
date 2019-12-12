import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import { minimalProjectConfig } from '@dword-design/base'

export const it = async () => {

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(minimalProjectConfig)
    await spawn('base', ['build'])
  })

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(minimalProjectConfig)
    await spawn('base', ['test'])
  })
}

export const timeout = 20000
