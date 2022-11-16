import chdir from '@dword-design/chdir'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import isCI from 'is-ci'
import outputFiles from 'output-files'
import P from 'path'
import withLocalTmpDir from 'with-local-tmp-dir'
import self from '.'

export default {
  'GitHub CLI exists': async () => {
    if (isCI) {
      await execa.command('gh repo list')
    }
  },
  'job matrix': function () {
    expect(
      self({
        nodeVersion: 14,
        supportedNodeVersions: [14, 16],
        useJobMatrix: true,
      })
    ).toMatchSnapshot(this)
  },
  'no job matrix': function () {
    expect({ nodeVersion: 14 }).toMatchSnapshot(this)
  },
  'package.json': function () {
    return withLocalTmpDir(async () => {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          foo: { type: 'string' },
        }),
        'repos/foo/package.json': JSON.stringify({}),
      })
      await chdir(P.join('repos', 'foo'), async () =>
        expect(self(await getConfig())).toMatchSnapshot(this)
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
      await chdir(P.join('repos', 'foo'), async () =>
        expect(self(await getConfig())).toMatchSnapshot(this)
      )
    })
  },
  'test environment variables': function () {
    return withLocalTmpDir(async () => {
      await outputFile(
        '.env.schema.json',
        { bar: {}, foo: {} } |> JSON.stringify
      )
      expect(self({ nodeVersion: 14 })).toMatchSnapshot(this)
    })
  },
  testInContainer() {
    expect(
      self({
        nodeVersion: 14,
        testInContainer: true,
        useJobMatrix: true,
      })
    ).toMatchSnapshot(this)
  },
}
