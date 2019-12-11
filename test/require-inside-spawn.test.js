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
    'node_modules/.bin/foo-cli': endent`
      #!/usr/bin/env node

      const importFrom = require('import-from')

      console.log(importFrom(process.cwd(), 'foo'))
    `,
    test: {
      'works.test.js': endent`
        import { spawn } from 'child_process'

        export default () => spawn('foo-cli', [], { stdio: 'inherit' })
      `,
    },
  })
  await chmod(P.join('node_modules', '.bin', 'foo-cli'), '755')
  await spawn('npm', ['test'], { stdio: 'inherit' })
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
