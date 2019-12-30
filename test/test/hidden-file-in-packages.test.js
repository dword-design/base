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
      '.DS_Store': '',
      a: {
        'src/index.js': 'export default 1',
        'test/foo.test.js': 'export default () => {}',
      },
    },
  })
  await spawn('base', ['build'], { capture: ['stdout'] })
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^

      ✓ foo

      1 passing \\(.*?\\)
  `))
})
