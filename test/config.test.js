import { spawn } from 'child_process'
import outputFiles from 'output-files'
import { endent } from '@functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'
import { readFile } from 'fs'
import getPackageName from 'get-package-name'

export const it = async () => {

  const files = {
    ...minimalProjectConfig,
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
      ...minimalPackageConfig,
      devDependencies: {
        'base-config-foo': '^1.0.0',
      },
    }), undefined, 2),
  }

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
    const { stdout } = await spawn('base', ['build'], { capture: ['stdout'] })
    expect(stdout).toEqual(endent`
      Copying config files …
      Updating README.md …
      foo
    ` + '\n')
    expect(await readFile('.gitignore', 'utf8')).toEqual(endent`
      .DS_Store
      /.editorconfig
      /.nyc_output
      /.vscode
      /coverage
      /dist
      /foo.txt
      /node_modules
    ` + '\n')
  })

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
    const { stdout } = await spawn('base', ['start'], { capture: ['stdout'] })
    expect(stdout).toEqual('bar\n')
  })

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles({
      ...files,
      '.gitignore': endent`
        .DS_Store
        /.editorconfig
        /.nyc_output
        /.vscode
        /coverage
        /dist
        /foo.txt
        /node_modules
      ` + '\n',
    })
    const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
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
}

export const timeout = 20000
