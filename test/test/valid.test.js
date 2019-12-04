import outputFiles from 'output-files'
import { spawn } from 'child_process'
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
    }, undefined, 2),
    'test/foo.test.js': endent`
      import foo from 'foo'
      import expect from 'expect'

      export default () => expect(foo).toEqual(1)
    `,
  })
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(/^Copying config files …\nSuccessfully compiled 1 file with Babel.\nNo depcheck issue\n\n\n  ✓ foo\n\n  1 passing.*?\n\n----------|----------|----------|----------|----------|-------------------|\nFile      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |\n----------|----------|----------|----------|----------|-------------------|\nAll files |        0 |        0 |        0 |        0 |                   |\n----------|----------|----------|----------|----------|-------------------|\n$/)
})

export const timeout = 25000
