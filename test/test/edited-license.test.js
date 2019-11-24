import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import projectConfig from '../project-config'
import { outputFile } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...projectConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify({
      name: 'foo',
      repository: 'bar/foo',
      license: 'MIT',
    }),
  })
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])
  await outputFile('LICENSE.md', 'foo')
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
  expect(stderr).toEqual('LICENSE.md file must be generated. Maybe it has been accidentally modified.\n')
})

export const timeout = 20000
