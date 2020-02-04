import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('README.md', endent`
    <!-- TITLE -->

    <!-- BADGES -->

    <!-- LICENSE -->

  `)
  await spawn('base', ['prepare'])
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toEqual('The README.md file is missing or misses the following sections: DESCRIPTION, INSTALL\n')
})
