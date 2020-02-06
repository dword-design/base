import withLocalTmpDir from 'with-local-tmp-dir'
import stealthyRequire from 'stealthy-require'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await spawn('git', ['init'])
  await spawn('git', ['remote', 'add', 'origin', 'git@special.com:bar/foo.git'])
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
  await expect(getPackageString()).rejects.toThrow('Only GitHub repositories are supported.')
})
