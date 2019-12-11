import outputFiles from 'output-files'
import { spawn } from 'child_process'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalProjectConfig } from '@dword-design/base'
import { endent } from '@functions'
import { chmod } from 'fs'
import P from 'path'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    test: {
      'cli.js': endent`
        #!/usr/bin/env node

        console.log('foo')
      `,
      'works.test.js': endent`
        import { spawn } from 'child_process'

        export default () => spawn(require.resolve('./cli'), [], { stdio: 'inherit' })
      `,
    },
  })
  await chmod(P.join('test', 'cli.js'), '755')
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^package.json valid
    No depcheck issue

      ✓ works

      1 passing \(*.?\)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n$'))
})

export const timeout = 20000
