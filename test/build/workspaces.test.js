import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'
import P from 'path'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      private: true,
      workspaces: ['packages/*'],
    }), undefined, 2),
    'packages/a': filesConfig,
    'packages/b': {
      ...filesConfig,
      'src/index.js': 'export default 2',
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
    'src',
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
