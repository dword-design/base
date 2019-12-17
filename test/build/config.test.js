import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'
import { readFile } from 'fs-extra'
import getPackageName from 'get-package-name'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
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
  })
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

export const timeout = 20000
