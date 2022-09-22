import chdir from '@dword-design/chdir'
import proxyquire from '@dword-design/proxyquire'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import isCI from 'is-ci'
import outputFiles from 'output-files'
import P from 'path'
import stealthyRequire from 'stealthy-require-no-leak'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'GitHub CLI exists': async () => {
    if (isCI) {
      await execa.command('gh status')
    }
  },
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
  'package.json': function () {
    return withLocalTmpDir(async () => {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          foo: { type: 'string' },
        }),
        'repos/foo/package.json': JSON.stringify({}),
      })
      await chdir(P.join('repos', 'foo'), () =>
        expect(
          stealthyRequire(require.cache, () => require('.'))
        ).toMatchSnapshot(this)
      )
    })
  },
  'package.json same path as .env.schema.json': function () {
    return withLocalTmpDir(async () => {
      await outputFiles({
        'repos/foo': {
          '.env.schema.json': JSON.stringify({
            foo: { type: 'string' },
          }),
          'package.json': JSON.stringify({}),
        },
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
