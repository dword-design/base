import withLocalTmpDir from 'with-local-tmp-dir'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import stealthyRequire from 'stealthy-require'

export default () => withLocalTmpDir(__dirname, async () => {
  const getPackageString = stealthyRequire(require.cache, () => require('../../src/get-package-string'))
  await outputFile('package.json', endent`
    {
      "private": true
    }

  `)
  expect(await getPackageString()).toMatch('"private": true')
})
