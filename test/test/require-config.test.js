import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import filesConfig from '../files.config'
import packageConfig from '../package.config'
import sortPackageJson from 'sort-package-json'
import { endent } from '@dword-design/functions'
import { chmod } from 'fs-extra'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
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
