import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import withLocalTmpDir from 'with-local-tmp-dir'
import execa from 'execa'

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'node_modules/base-config-foo/index.js': endent`
        module.exports = {
          commands: {
            prepublishOnly: () => console.log('foo'),
          },
        }
      `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
            devDependencies: {
              'base-config-foo': '^1.0.0',
            },
          },
          undefined,
          2
        ),
        'src/index.js': 'export default 1',
      })
      const output = await execa(require.resolve('./cli'), ['prepublishOnly'], {
        all: true,
      })
      expect(output.all).toEqual('foo')
    }),
}
