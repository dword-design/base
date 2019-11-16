import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import expect from 'expect'
import { outputFile, exists } from 'fs'
import { endent } from '@functions'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await spawn('git', ['init'])
  await outputFile('.git/hooks/pre-commit', endent`
    # base
    foo
  `)
  const { stdout } = await spawn(
    resolveBin.sync('@dword-design/base', { executable: 'base' }),
    ['unregister'],
    { capture: ['stdout'] }
  )
  expect(stdout).toEqual('Unregistering git hooks …\n')
  expect(await exists('.git/hooks/pre-commit')).toBeFalsy()
})
export const timeout = 20000
