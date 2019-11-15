import withLocalTmpDir from 'with-local-tmp-dir'
import resolveBin from 'resolve-bin'
import { spawn } from 'child_process'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import { resolve } from 'path'
import { endent } from '@functions'
import { readFile, exists } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'dist/foo.js': '',
    'src/index.js': 'export default \'hi\'',
    'package.json': JSON.stringify({
      name: 'foo',
    }),
    'README.md': endent`
      <!--@h1([pkg.name])-->
      <!--/@-->
    `,
  })
  const { stdout } = await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'], { capture: ['stdout'] })
  expect(stdout).toEqual(endent`
    Copying config files …
    Successfully compiled 1 file with Babel.
    updated README.md
  ` + '\n')
  expect(await glob('*', { dot: true })).toEqual(['.editorconfig', '.gitignore', '.gitpod.yml', '.travis.yml', 'dist', 'package.json', 'README.md', 'src'])
  expect(require(resolve('dist'))).toEqual('hi')
  expect(await readFile('README.md', 'utf8')).toEqual(endent`
    <!--@h1([pkg.name])-->
    # foo
    <!--/@-->
  ` + '\n')
  expect(await exists('dist/foo.js')).toBeFalsy()
})

export const timeout = 8000
