import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import { exists } from 'fs'
import expect from 'expect'
import { minimalProjectConfig } from '@dword-design/base'
import outputFiles from 'output-files'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/index.js': 'console.log(\'hi\');',
  })
  await expect(spawn('base', ['build'])).rejects.toThrow()
  expect(await exists('dist')).toBeFalsy()
})

export const timeout = 8000
