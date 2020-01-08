import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import expect from 'expect'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "workspaces": ["packages/*"]
      }
    `,
    packages: {
      a: {
        'package.json': endent`
          {
            "name": "a"
          }

        `,
        'src/index.js': 'export default 1',
        'test/foo.test.js': 'export default () => console.log(\'run foo\')',
      },
      b: {
        'package.json': endent`
          {
            "name": "b"
          }

        `,
        'src/index.js': 'export default 1',
        'test/bar.test.js': 'export default () => console.log(\'run bar\')',
      },
    },
  })
  await spawn('base', ['build'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch('run foo\n')
  expect(stdout).toMatch('run bar\n')
})
