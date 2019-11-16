import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import outputFiles from 'output-files'
import resolveBin from 'resolve-bin'
import expect from 'expect'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await spawn('git', ['init'])
  await outputFiles({
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
  let stderr
  await spawn('git', ['add', '.'])
  try {
    await spawn('git', ['commit', '-m', 'foo'], { capture: ['stderr'] })
  } catch (error) {
    stderr = error.stderr
  }
  expect(stderr).toMatch('1:17  error  Extra semicolon  semi')
})
export const timeout = 40000
