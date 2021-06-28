import { endent, keys } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

export default {
  'package.json script sort order': async () => {
    const self = await proxyquire('.', {
      './package-config': {
        scripts: {
          dev: 'base dev',
          test: 'base test',
        },
      },
    })()
    expect(self['package.json']).toEqual(endent`
      {
        "scripts": {
          "dev": "base dev",
          "test": "base test"
        }
      }

    `)
  },
  async works() {
    const self = await proxyquire('.', {})()
    expect(self |> keys).toMatchSnapshot(this)
  },
}
