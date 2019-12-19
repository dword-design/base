import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      dependencies: {
        'change-case': '^0.1.0',
      },
    }), undefined, 2) + '\n',
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
  ` + '\n')
})
