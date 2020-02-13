import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "name": "foo"
      }

    `,
    'src/index.js': 'export default 1',
    'test/foo.test.js': endent`
      import foo from 'foo'

      export default () => {
        expect(process.env.NODE_ENV).toEqual('test')
        expect(foo).toEqual(1)
      }
    `,
  })
  await spawn('base', ['prepare'])
  const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
  expect(stdout).toMatch(new RegExp(endent`
    ^

      ✓ foo

      1 passing \\(.*?\\)
  `))
  expect(await glob('*', { dot: true })).toEqual([
    '.cz.json',
    '.editorconfig',
    '.eslintrc.json',
    '.github',
    '.gitignore',
    '.gitpod.Dockerfile',
    '.gitpod.yml',
    '.nyc_output',
    '.releaserc.json',
    '.renovaterc.json',
    'coverage',
    'LICENSE.md',
    'node_modules',
    'package.json',
    'README.md',
    'src',
    'test',
  ])
})
