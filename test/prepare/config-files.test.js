import withLocalTmpDir from 'with-local-tmp-dir'
import resolveBin from 'resolve-bin'
import { spawn } from 'child_process'
import { outputFile } from 'fs'
import expect from 'expect'
import glob from 'glob-promise'

export default {
  it: () => withLocalTmpDir(async () => {
    await outputFile('src/index.js', 'console.log(\'hi\')')
    await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])
    expect(await glob('*', { dot: true })).toEqual(['.editorconfig', '.gitignore', '.gitpod.yml', '.travis.yml', 'dist', 'src'])
  }),
  timeout: 8000,
}
