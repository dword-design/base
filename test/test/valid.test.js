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
      main: 'dist/index.js',
      repository: 'bar/foo',
      license: 'MIT',
      files: [
        'dist',
      ],
      devDependencies: {
        expect: '^0.1.0',
      },
    }),
    'test/foo.test.js': endent`
      import foo from 'foo'
      import expect from 'expect'

      export default () => expect(foo).toEqual(1)
    `,
  })
  await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'])
  const { stdout } = await spawn(
    resolveBin.sync('@dword-design/base', { executable: 'base' }),
    ['test'],
    { capture: ['stdout'] }
  )
  expect(stdout).toMatch(/^Copying config files …\nSuccessfully compiled 1 file with Babel.\nNo depcheck issue\n\n\n  ✓ foo\n\n  1 passing.*?\n\n----------|----------|----------|----------|----------|-------------------|\nFile      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |\n----------|----------|----------|----------|----------|-------------------|\nAll files |        0 |        0 |        0 |        0 |                   |\n----------|----------|----------|----------|----------|-------------------|\n$/)
})

export const timeout = 25000
