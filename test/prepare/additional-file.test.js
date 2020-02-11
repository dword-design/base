import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'src/index.js': 'export default 1',
    'test/foo.test.js': '',
  })
  await spawn('base', ['prepare'])
  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.github',
    '.gitignore',
    '.gitpod.Dockerfile',
    '.gitpod.yml',
    '.renovaterc.json',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
    'test',
  ])
})
