import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'node_modules/bar/index.js': 'export default 1',
    'package.json': endent`
      {
        "dependencies": {
          "bar": "^1.0.0"
        }
      }

    `,
    'src/index.js': 'export default 1',
    'test/valid.test.js': endent`
      import bar from 'bar'

      export default bar
    `,
  })
  await spawn('base', ['prepare'])
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch(endent`
    Unused dependencies
    * bar
  `)
})
