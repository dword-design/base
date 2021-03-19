import proxyquire from '@dword-design/proxyquire'

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
