import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import P from 'path'
import { endent } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {

  await outputFiles({
    'package.json': endent`
      {
        "workspaces": ["packages/*"]
      }

    `,
    packages: {
      a: {
        'package.json': endent`
          {
            "name": "a"
          }

        `,
        'src/index.js': 'export default 1',
      },
      b: {
        'package.json': endent`
          {
            "name": "b"
          }

        `,
        'src/index.js': 'export default 2',
      },
    },
  })

  await spawn('base', ['prepare'])

  expect(await glob('*', { dot: true })).toEqual([
    '.editorconfig',
    '.github',
    '.gitignore',
    '.gitpod.Dockerfile',
    '.gitpod.yml',
    '.renovaterc.json',
    'LICENSE.md',
    'package.json',
    'packages',
    'README.md',
  ])
  expect(await glob('*', { cwd: P.resolve('packages', 'a'), dot: true })).toEqual([
    '.gitignore',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
  ])
  expect(await glob('*', { cwd: P.resolve('packages', 'b'), dot: true })).toEqual([
    '.gitignore',
    'LICENSE.md',
    'package.json',
    'README.md',
    'src',
  ])
})
