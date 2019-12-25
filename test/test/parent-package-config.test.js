import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'
import filesConfig from '../files.config'
import packageConfig from '../package.config'
import sortPackageJson from 'sort-package-json'
import { endent } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...filesConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...packageConfig,
      name: 'base-config-foo',
      devDependencies: {
        'base-config-foo': '^1.0.0',
      },
    }), undefined, 2),
    'src/index.js': endent`
      export default {
        build: () => 1,
      }
    `,
    'test/valid.test.js': endent`
      export default () => {}
    `,
    'bas.js': endent`
      #!/usr/bin/env node

      console.log('foo')
    `,
  })
  await spawn('base', ['build'])
  await spawn('base', ['test'])
})
