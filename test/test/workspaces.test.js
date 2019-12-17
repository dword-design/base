import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import { minimalPackageConfig, minimalProjectConfig, minimalWorkspaceConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'
import expect from 'expect'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      private: true,
      workspaces: ['packages/*'],
    }), undefined, 2),
    'packages/a': {
      ...minimalWorkspaceConfig,
      'test/foo.test.js': endent`
        export default () => {}
      `,
    },
    'packages/b': {
      ...minimalWorkspaceConfig,
      'test/bar.test.js': endent`
        export default () => {}
      `,
    },
  })
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    package\\.json valid
    No depcheck issue

    > foo@1\\.0\\.0 test .*?\\/packages\\/a
    > base test

    package\\.json valid
    No depcheck issue


      ✓ foo

    1 passing \\(.*?\\)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|

    > foo@1\\.0\\.0 test \\/packages\\/b
    > base test

    package\\.json valid
    No depcheck issue


      ✓ bar

    1 passing \\(.*?\\)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n'))
})

export const timeout = 30000
