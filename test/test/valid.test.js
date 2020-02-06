import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "name": "foo"
      }

    `,
    'src/index.js': 'export default 1',
    'test/foo.test.js': endent`
      import foo from 'foo'

      export default () => {
        expect(process.env.NODE_ENV).toEqual('test')
        expect(foo).toEqual(1)
      }
    `,
  })
  await spawn('base', ['prepare'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^

      ✓ foo

      1 passing \\(.*?\\)

    ----------\\|----------\\|----------\\|----------\\|----------\\|-------------------\\|
    File      \\|  % Stmts \\| % Branch \\|  % Funcs \\|  % Lines \\| Uncovered Line #s \\|
    ----------\\|----------\\|----------\\|----------\\|----------\\|-------------------\\|
    All files \\|        0 \\|        0 \\|        0 \\|        0 \\|                   \\|
    ----------\\|----------\\|----------\\|----------\\|----------\\|-------------------\\|
    $
  `))
  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.eslintrc.json',
    '.github',
    '.gitignore',
    '.gitpod.yml',
    '.nyc_output',
    '.renovaterc.json',
    'coverage',
    'LICENSE.md',
    'node_modules',
    'package.json',
    'README.md',
    'src',
    'test',
  ])
})
