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
        'package.json': endent`
        {
          "baseConfig": "foo",
          "devDependencies": {
            "base-config-foo": "^1.0.0"
          }
        }

      `,
        'src/index.js': 'export default 1',
      })
      const { all } = await execa(
        require.resolve('./cli'),
        ['prepublishOnly'],
        { all: true }
      )
      expect(all).toEqual('foo')
    }),
}
