import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        expect: '^0.1.0',
      },
    }), undefined, 2) + '\n',
    'test/foo.test.js': endent`
      import expect from 'expect'

      export default () => expect(1).toEqual(2)
    `,
  })
  let stdout
  try {
    await spawn('base', ['build'])
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Error: expect(received).toEqual(expected)')
})
