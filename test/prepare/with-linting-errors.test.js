import withLocalTmpDir from 'with-local-tmp-dir'
import resolveBin from 'resolve-bin'
import { spawn } from 'child_process'
import { outputFile } from 'fs'
import expect from 'expect'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFile('src/index.js', 'console.log(\'hi\');')
  await expect(spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])).rejects.toThrow()
})

export const timeout = 8000
