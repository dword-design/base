import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import filesConfig from '../files.config'
import packageConfig from '../package.config'
import sortPackageJson from 'sort-package-json'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'node_modules/bar/index.js': 'export default 1',
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      dependencies: {
        bar: '^1.0.0',
      },
    }), undefined, 2),
    'test/valid.test.js': endent`
      import bar from 'bar'

      export default bar
    `,
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
    * bar
  `)
})
