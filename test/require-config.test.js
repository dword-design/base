import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import { minimalProjectConfig, minimalPackageConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'
import { endent } from '@functions'
import { chmod } from 'fs'
import { spawn } from 'child_process'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      devDependencies: {
        '@dword-design/base-config-foo': '^1.0.0',
      },
    }), undefined, 2),
    'bas.js': endent`
      #!/usr/bin/env node
      console.log('foo')
    `,
  })
  await chmod('bas.js', '755')
  await spawn('./bas.js', [])
})
