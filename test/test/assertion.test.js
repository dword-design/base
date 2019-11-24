import outputFiles from 'output-files'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@functions'
import expect from 'expect'
import projectConfig from '../project-config'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...projectConfig,
    'src/index.js': 'export default 1',
    'package.json': JSON.stringify({
      name: 'foo',
      repository: 'bar/foo',
      license: 'MIT',
      devDependencies: {
        expect: '^0.1.0',
      },
    }),
    'test/foo.test.js': endent`
      import expect from 'expect'

      export default () => expect(1).toEqual(2)
    `,
  })
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
