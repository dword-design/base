import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    node_modules: {
      'foo/index.js': 'module.exports = 2',
      'bar/index.js': 'module.exports = require(\'foo\')',
    },
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        bar: '^1.0.0',
        expect: '^1.0.0',
      },
    }), undefined, 2),
    'test/works.test.js': endent`
      import bar from 'bar'
      import expect from 'expect'

      export default () => expect(bar).toEqual(1)
    `,
  })
  await spawn('base', ['build'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^package.json valid
    No depcheck issue

      ✓ works

      1 passing \(*.?\)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n$'))
})
