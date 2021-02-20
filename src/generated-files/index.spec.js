import { endent } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'

export default {
  'package.json script sort order': () => {
    const self = proxyquire('.', {
      './package-config.js': {
        scripts: {
          test: 'base test',
          dev: 'base dev',
        },
      },
    })
    expect(self['package.json']).toEqual(endent`
      {
        "scripts": {
          "dev": "base dev"
          "test": "base test",
        }
      }

    `)
  },
}
