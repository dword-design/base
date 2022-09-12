import chdir from '@dword-design/chdir'
import proxyquire from '@dword-design/proxyquire'
import { outputFile } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'
import stealthyRequire from 'stealthy-require-no-leak'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'job matrix': function () {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 14,
          supportedNodeVersions: [12, 14],
          useJobMatrix: true,
        },
      })
    ).toMatchSnapshot(this)
  },
  'no job matrix': function () {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 14,
        },
      })
    ).toMatchSnapshot(this)
  },
  subdir() {
    return withLocalTmpDir(async () => {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          foo: { type: 'string' },
        }),
        'repos/foo': {},
      })
      await chdir(P.join('repos', 'foo'), () =>
        expect(
          stealthyRequire(require.cache, () => require('.'))
        ).toMatchSnapshot(this)
      )
    })
  },
  'test environment variables': function () {
    return withLocalTmpDir(async () => {
      await outputFile(
        '.env.schema.json',
        { bar: {}, foo: {} } |> JSON.stringify
      )
      expect(
        proxyquire('.', {
          '../../config': {
            nodeVersion: 14,
          },
          './strategies/simple': proxyquire('./strategies/simple', {
            '../steps/test': proxyquire('./steps/test', {}),
          }),
        })
      ).toMatchSnapshot(this)
    })
  },
  testInContainer() {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 14,
          testInContainer: true,
          useJobMatrix: true,
        },
      })
    ).toMatchSnapshot(this)
  },
}
