import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@functions'
import projectConfig from '../project-config'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...projectConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify({
      name: 'foo',
      repository: 'bar/foo',
      license: 'MIT',
      main: 'dist/index.js',
      files: [
        'dist',
      ],
      dependencies: {
        'change-case': '^0.1.0',
      },
    }),
  })
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

export const timeout = 20000
