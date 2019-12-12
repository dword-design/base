import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import { endent } from '@dword-design/functions'
import { chmod } from 'fs-extra'
import P from 'path'
import sortPackageJson from 'sort-package-json'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      dependencies: {
        'child-process-promise': '^1.0.0',
      },
    }), undefined, 2),
    test: {
      'cli.js': endent`
        #!/usr/bin/env node

        console.log('foo')
      `,
      'works.test.js': endent`
        import { spawn } from 'child-process-promise'

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
