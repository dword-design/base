import { endent, keys } from '@dword-design/functions'

import { Base } from './..'

export default {
  'package.json script sort order': () => {
    expect(
      new Base({
        package: {
          scripts: {
            dev: 'base dev',
            test: 'base test',
          },
        },
      }).getGeneratedFiles()['package.json']
    ).toEqual(endent`
      {
        "scripts": {
          "dev": "base dev",
          "test": "base test"
        }
      }

    `)
  },
  works() {
    expect(new Base().getGeneratedFiles() |> keys).toMatchSnapshot(this)
  },
}
