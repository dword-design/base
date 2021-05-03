import proxyquire from '@dword-design/proxyquire'
import { outputFile } from 'fs-extra'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'job matrix': function () {
    expect(
      proxyquire('.', {
        '../../config': {
          nodeVersion: 14,
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
