import { spawn } from 'child_process'
import outputFiles from 'output-files'
import { endent } from '@functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'node_modules/base-config-foo/index.js': endent`
      exports.build = () => console.log('foo')
      exports.start = () => console.log('bar')
      exports.lint = () => console.log('baz')
    `,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      devDependencies: {
        'base-config-foo': '^1.0.0',
      },
    }), undefined, 2),
  })

  let { stdout } = await spawn('base', ['build'], { capture: ['stdout'] })
  expect(stdout).toEqual(endent`
    Copying config files …
    Updating README.md …
    foo
  ` + '\n')

  stdout = (await spawn('base', ['start'], { capture: ['stdout'] })).stdout
  expect(stdout).toEqual(endent`
    Copying config files …
    Updating README.md …
    bar
  ` + '\n')

  stdout = (await spawn('base', ['test'], { capture: ['stdout'] })).stdout
  expect(stdout).toMatch(new RegExp(endent`
    ^baz
    package.json valid
    No depcheck issue


      0 passing (1ms)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n$'))
})

export const timeout = 20000
