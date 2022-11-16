import { endent, keys } from '@dword-design/functions'
import self from '.'

export default {
  'package.json script sort order': () => {
    expect(self({ package: {
      scripts: {
        dev: 'base dev',
        test: 'base test',
      },
    }})
      ['package.json']).toEqual(endent`
      {
        "scripts": {
          "dev": "base dev",
          "test": "base test"
        }
      }

    `)
  },
  works() {
    expect(self() |> keys).toMatchSnapshot(this)
  },
}
