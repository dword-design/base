import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import getPackageName from 'get-package-name'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-foo/index.js': endent`
      module.exports = {
        build: () => console.log('foo'),
        start: () => console.log('bar'),
        lint: () => console.log('baz'),
        gitignore: ['/foo.txt'],
        babelConfig: require('${getPackageName(require.resolve('@dword-design/babel-config'))}'),
      }
    `,
    'package.json': endent`
      {
        "baseConfig": "foo",
        "devDependencies": {
          "base-config-foo": "^1.0.0"
        }
      }

    `,
  })
  const { stdout } = await spawn('base', ['start'], { capture: ['stdout'] })
  expect(stdout).toEqual('bar\n')
})
