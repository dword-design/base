import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import { chmod } from 'fs-extra'
import P from 'path'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "name": "foo",
        "devDependencies": {
          "child-process-promise": "^1.0.0"
        }
      }

    `,
    'src/index.js': 'export default \'foo\'',
    test: {
      'cli.js': endent`
        #!/usr/bin/env node

        import foo from 'foo'

        console.log(foo)
      `,
      'works.test.js': endent`
        import { spawn } from 'child-process-promise'

        export default () => spawn(require.resolve('./cli'), [], { stdio: 'inherit' })
      `,
    },
  })
  await chmod(P.join('test', 'cli.js'), '755')
  await spawn('base', ['prepare'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^

    foo
      ✓ works \\(.*?\\)

      1 passing \\(.*?\\)
  `))
})
