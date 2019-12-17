import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import { endent } from '@dword-design/functions'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
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
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^Copying config files …
    Successfully compiled 1 file with Babel.
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
    '.eslintrc.json',
    '.gitignore',
    '.gitpod.yml',
    '.nyc_output',
    '.renovaterc.json',
    '.travis.yml',
    'coverage',
    'LICENSE.md',
    'node_modules',
    'package.json',
    'README.md',
    'src',
    'test',
  ])
})

export const timeout = 20000
