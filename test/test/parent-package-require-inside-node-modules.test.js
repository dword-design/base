import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    node_modules: {
      'bar/index.js': 'module.exports = require(\'foo\')',
    },
    'package.json': endent`
      {
        "name": "foo",
        "devDependencies": {
          "bar": "^1.0.0",
          "expect": "^1.0.0"
        }
      }

    `,
    'src/index.js': 'export default 1',
    'test/works.test.js': endent`
      import bar from 'bar'
      import expect from 'expect'

      export default () => expect(bar).toEqual(1)
    `,
  })
  await spawn('base', ['prepare'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^

      ✓ works

      1 passing \\(.*?\\)
  `))
})
