import { endent, keys } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

export default {
  'no metadata sync': function () {
    const self = proxyquire('.', {
      '../config': {
        syncMetadata: false,
      },
    })
    expect(self |> keys).toMatchSnapshot(this)
  },
  'package.json script sort order': () => {
    const self = proxyquire('.', {
      './package-config': {
        scripts: {
          dev: 'base dev',
          test: 'base test',
        },
      },
    })
    expect(self['package.json']).toEqual(endent`
      {
        "scripts": {
          "dev": "base dev",
          "test": "base test"
        }
      }

    `)
  },
  works() {
    const self = proxyquire('.', {})
    expect(self |> keys).toMatchSnapshot(this)
  },
}
