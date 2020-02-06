import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  // relevant e.g. for base-config-node
  await outputFiles({
    inner: {
      'package.json': endent`
        {
          "baseConfig": "foo",
          "devDependencies": {
            "base-config-foo": "^1.0.0"
          }
        }

      `,
      'test/valid.test.js': endent`
        import foo from 'base-config-foo'

        export default () => expect(foo.prepublishOnly()).toEqual(1)
      `,
    },
    'package.json': endent`
      {
        "name": "base-config-foo",
        "main": "src/index.js"
      }

    `,
    'src/index.js': endent`
      export default {
        prepublishOnly: () => 1,
      }
    `,
  })
  process.chdir('inner')
  await spawn('base', ['prepare'])
  await spawn('base', ['test'])
})
