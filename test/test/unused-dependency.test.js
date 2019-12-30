import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "dependencies": {
          "change-case": "^0.1.0"
        }
      }

    `,
    'src/index.js': 'export default 1',
  })
  await spawn('base', ['build'])
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch(endent`
    Unused dependencies
    * change-case

  `)
})
