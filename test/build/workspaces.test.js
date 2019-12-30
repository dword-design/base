import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import P from 'path'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "workspaces": ["packages/*"]
      }

    `,
    packages: {
      'a/src/index.js': 'export default 1',
      'b/src/index.js': 'export default 2',
    },
  })
  await spawn('base', ['build'])
  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.gitignore',
    '.gitpod.yml',
    '.renovaterc.json',
    '.travis.yml',
    'LICENSE.md',
    'package.json',
    'packages',
    'README.md',
  ])
  expect(await glob('*', { cwd: P.resolve('packages', 'a'), dot: true })).toEqual([
    '.eslintrc.json',
    '.gitignore',
    'dist',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
  ])
  expect(await glob('*', { cwd: P.resolve('packages', 'b'), dot: true })).toEqual([
    '.eslintrc.json',
    '.gitignore',
    'dist',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
  ])
  expect(require(P.resolve('packages', 'a', 'dist'))).toEqual(1)
  expect(require(P.resolve('packages', 'b', 'dist'))).toEqual(2)
})
