import { endent, keys } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'

import { Base } from './..'

export default tester(
  {
    'package.json script sort order': async () => {
      await outputFile(
        'package.json',
        JSON.stringify({
          scripts: {
            dev: 'base dev',
            test: 'base test',
          },
        })
      )
      expect(new Base().getGeneratedFiles()['package.json']).toEqual(endent`
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
  },
  [testerPluginTmpDir()]
)
