import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import { exists } from 'fs'
import resolveBin from 'resolve-bin'
import expect from 'expect'
import outputFiles from 'output-files'

export const it = () => withLocalTmpDir(async () => {
  await spawn('git', ['init'])
  await outputFiles({
    'package.json': JSON.stringify({
      scripts: {
        test: 'base test',
      },
      devDependencies: {
        '@dword-design/base': '^0.1.0',
      },
    }),
    'src/index.js': 'export default 1',
  })
  const { stdout } = await spawn(
    resolveBin.sync('@dword-design/base', { executable: 'base' }),
    ['register'],
    { capture: ['stdout'] }
  )
  expect(stdout).toEqual('Registering git hooks …\n')
  expect(await exists('.git/hooks/pre-commit')).toBeTruthy()
  await spawn('git', ['add', '.'])
  await spawn('git', ['commit', '-m', 'foo'])
})
export const timeout = 40000
