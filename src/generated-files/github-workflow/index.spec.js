import proxyquire from '@dword-design/proxyquire'
import withLocalTmpDir from 'with-local-tmp-dir'
import { outputFile } from 'fs-extra'

export default {
  docker() {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 12,
          useJobMatrix: true,
          usesDocker: true,
        },
      })
    ).toMatchSnapshot(this)
  },
  'job matrix': function () {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 12,
          useJobMatrix: true,
        },
      })
    ).toMatchSnapshot(this)
  },
  'no job matrix': function () {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 12,
        },
      })
    ).toMatchSnapshot(this)
  },
  'test environment variables': function () {
    return withLocalTmpDir(async () => {
      await outputFile('.env.schema.json', { foo: {}, bar: {} } |> JSON.stringify)
      expect(
        proxyquire('.', {
          '../../config': {
            nodeVersion: 12,
          },
          './strategies/simple': proxyquire('./strategies/simple', {
            '../steps/test': proxyquire('./steps/test', {})
          })
        })
      ).toMatchSnapshot(this)
    })
  },
  testInContainer() {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 12,
          testInContainer: true,
          useJobMatrix: true,
        },
      })
    ).toMatchSnapshot(this)
  },
}
