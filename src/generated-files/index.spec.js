import proxyquire from '@dword-design/proxyquire'
import { endent } from '@dword-design/functions'
import self from '.'

export default {
  'package.json script sort order': () => {
    const self = proxyquire('.', {
      './package-config.js': {
        scripts: {
          foo: 'base foo',
          bar: 'base bar',
        }
      }
    })
    expect(self['package.json']).toEqual(endent`
      {
        "scripts": {
          "bar": "base bar",
          "foo": "base foo"
        }
      }
      
    `)
  }
}
