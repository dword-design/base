import withLocalTmpDir from 'with-local-tmp-dir'
import resolveBin from 'resolve-bin'
import { spawn } from 'child_process'
import { exists } from 'fs'
import expect from 'expect'
import projectConfig from '../project-config'
import outputFiles from 'output-files'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...projectConfig,
    'src/index.js': 'console.log(\'hi\');',
  })
  await expect(spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])).rejects.toThrow()
  expect(await exists('dist')).toBeFalsy()
})

export const timeout = 8000
