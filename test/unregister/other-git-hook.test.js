import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import resolveBin from 'resolve-bin'
import expect from 'expect'
import { readFile, outputFile } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await spawn('git', ['init'])
  await outputFile('.git/hooks/pre-commit', 'foo')
  const { stdout } = await spawn(
    resolveBin.sync('@dword-design/base', { executable: 'base' }),
    ['unregister'],
    { capture: ['stdout'] }
  )
  expect(stdout).toEqual('')
  expect(await readFile('.git/hooks/pre-commit', 'utf8')).toEqual('foo')
})
export const timeout = 20000
