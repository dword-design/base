import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent, omit } from '@functions'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify({
      ...minimalPackageConfig |> omit('maintainers'),
      dependencies: {
        'change-case': '^0.1.0',
      },
      maintainers: minimalPackageConfig.maintainers,
    }, undefined, 2) + '\n',
  })
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['build'])
  let stderr
  try {
    await spawn(
      resolveBin.sync('@dword-design/base', { executable: 'base' }),
      ['test'],
      { capture: ['stderr'] }
    )
  } catch (error) {
    stderr = error.stderr
  }
  expect(stderr).toMatch(endent`
    Unused dependencies
    * change-case
  ` + '\n')
})

export const timeout = 25000
