import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'
import getPackageName from 'get-package-name'
import { outputFile } from 'fs-extra'

export default async () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'node_modules/base-config-foo/index.js': endent`

      module.exports = {
        build: () => console.log('foo'),
        start: () => console.log('bar'),
        lint: () => console.log('baz'),
        gitignore: ['/foo.txt'],
        babelConfig: require('${getPackageName(require.resolve('@dword-design/babel-config'))}'),
      }
    `,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        'base-config-foo': '^1.0.0',
      },
    }), undefined, 2),
  })
  await spawn('base', ['build'])
  await outputFile('.gitignore', endent`
    .DS_Store
    /.editorconfig
    /.nyc_output
    /.vscode
    /coverage
    /dist
    /foo.txt
    /node_modules
  ` + '\n')
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^baz
    package.json valid
    No depcheck issue


      0 passing \(.*?\)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n$'))
})
