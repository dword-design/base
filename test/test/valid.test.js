import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import { endent } from '@dword-design/functions'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        expect: '^0.1.0',
      },
    }), undefined, 2),
    'test/foo.test.js': endent`
      import foo from 'foo'
      import expect from 'expect'

      export default () => {
        expect(process.env.NODE_ENV).toEqual('test')
        expect(foo).toEqual(1)
      }
    `,
  })
  await spawn('base', ['build'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^Successfully compiled 1 file with Babel.
    No depcheck issue


    ✓ foo

    1 passing.*?

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n$'))
  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.eslintrc.json',
    '.gitignore',
    '.gitpod.yml',
    '.nyc_output',
    '.renovaterc.json',
    '.travis.yml',
    'coverage',
    'dist',
    'LICENSE.md',
    'node_modules',
    'package.json',
    'README.md',
    'src',
    'test',
  ])
})
