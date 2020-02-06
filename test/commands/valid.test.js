import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/base-config-foo/index.js': endent`
      module.exports = {
        commands: {
          prepublishOnly: () => console.log('foo'),
        },
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
    'src/index.js': 'export default 1',
  })
  const { stdout } = await spawn('base', ['prepublishOnly'], { capture: ['stdout'] })
  expect(stdout).toEqual('foo\n')
})
