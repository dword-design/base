import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'
import { readFile } from 'fs-extra'
import getPackageName from 'get-package-name'

export default () => withLocalTmpDir(__dirname, async () => {
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
