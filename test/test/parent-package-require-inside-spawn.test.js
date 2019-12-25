import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import { endent } from '@dword-design/functions'
import { chmod } from 'fs-extra'
import P from 'path'
import sortPackageJson from 'sort-package-json'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
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
  await spawn('base', ['build'])
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
