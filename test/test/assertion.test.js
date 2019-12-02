import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent, omit } from '@functions'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify({
      ...minimalPackageConfig |> omit('maintainers'),
      devDependencies: {
        expect: '^0.1.0',
      },
      maintainers: minimalPackageConfig.maintainers,
    }, undefined, 2) + '\n',
    'test/foo.test.js': endent`
      import expect from 'expect'

      export default () => expect(1).toEqual(2)
    `,
  })
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])
  let stdout
  try {
    await spawn(
      resolveBin.sync('@dword-design/base', { executable: 'base' }),
      ['test'],
      { capture: ['stdout'] }
    )
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toMatch('Error: expect(received).toEqual(expected)')
})

export const timeout = 20000
