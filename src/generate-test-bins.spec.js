import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import execa from 'execa'
import generateTestBins from './generate-test-bins'
import binLinks from 'bin-links'

export default {
  valid: () => withLocalTmpDir(async () => {
    await outputFiles({
      'package.json': endent`
        {
          "bin": {
            "foo": "./dist/cli.js"
          }
        }
      `,
      'src/cli.js': 'console.log(\'foo\')',
    })
    await generateTestBins()
    const { all } = await execa.command('npx foo', { all: true })
    expect(all).toEqual('foo')
  }),
  empty: () => withLocalTmpDir(() => generateTestBins()),
  existing: () => withLocalTmpDir(async () => {
    await outputFiles({
      'node_modules/foo/dist/cli.js': 'console.log(\'bar\')',
      'package.json': endent`
        {
          "bin": {
            "foo": "./dist/cli.js"
          }
        }
      `,
      'src/cli.js': 'console.log(\'foo\')',
    })
    await binLinks({ path: 'node_modules/foo', pkg: { bin: { foo: './dist/cli.js' } } })
    await generateTestBins()
    const { all } = await execa.command('npx foo', { all: true })
    expect(all).toEqual('foo')
  }),
}
