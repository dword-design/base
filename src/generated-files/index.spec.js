import { endent } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

export default {
  'package.json script sort order': () => {
    const self = proxyquire('.', {
      './package-config.js': {
        scripts: {
          bar: 'base bar',
          foo: 'base foo',
        },
      },
    })
    expect(self['package.json']).toEqual(endent`
      {
        "scripts": {
          "bar": "base bar",
          "foo": "base foo"
        }
      }

    `)
  },
}
