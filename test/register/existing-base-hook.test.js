import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import outputFiles from 'output-files'
import resolveBin from 'resolve-bin'
import expect from 'expect'
import { endent } from '@functions'
import { readFile } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await spawn('git', ['init'])
  const hook = endent`
    # base
    foo
  `
  await outputFiles({
    '.git/hooks/pre-commit': hook,
    'package.json': JSON.stringify({
      scripts: {
        test: 'base test',
      },
    }),
    'src/index.js': 'export default 1;',
  })
  await spawn(
    resolveBin.sync('@dword-design/base', { executable: 'base' }),
    ['register'],
    { capture: ['stdout'] }
  )
  expect(await readFile('.git/hooks/pre-commit')).not.toEqual(hook)
})
export const timeout = 20000
