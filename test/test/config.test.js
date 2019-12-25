import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import packageConfig from '../package.config'
import filesConfig from '../files.config'
import sortPackageJson from 'sort-package-json'
import getPackageName from 'get-package-name'

export default async () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'node_modules/base-config-foo/index.js': endent`
      module.exports = {
        babelConfig: {
          extends: '${getPackageName(require.resolve('@dword-design/babel-config'))}',
          plugins: [
            ({ types: t }) => ({
              visitor: {
                NumericLiteral: path => {
                  if (path.node.value === 1337) {
                    path.replaceWith(t.numericLiteral(path.node.value + 1))
                  }
                },
              },
            }),
          ],
        },
      }
    `,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      devDependencies: {
        'base-config-foo': '^1.0.0',
        expect: '^1.0.0',
      },
    }), undefined, 2),
    'src/index.js': 'export default 1337',
    'test/valid.test.js': endent`
      import foo from 'foo'
      import expect from 'expect'

      export default () => expect(foo).toEqual(1338)
    `,
  })
  await spawn('base', ['build'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^package.json valid
    No depcheck issue


      1 passing \(.*?\)

    ----------|----------|----------|----------|----------|-------------------|
    File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
    ----------|----------|----------|----------|----------|-------------------|
    All files |        0 |        0 |        0 |        0 |                   |
    ----------|----------|----------|----------|----------|-------------------|
  ` + '\n$'))
})
