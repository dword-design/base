import P from 'path'
import { mapValues, split, map, join, endent, values } from '@dword-design/functions'
import { outputFile, chmod, remove } from 'fs-extra'
import safeRequire from 'safe-require'

export default async () => {
  const { bin: binEntries = {} } = safeRequire(P.join(process.cwd(), 'package.json')) ?? {}
  binEntries
    |> mapValues(async (filename, binName) => {

      const replacedFilename = filename
        |> split('/')
        |> map(segment => segment === 'dist' ? 'src' : segment)
        |> join('/')

      return remove(P.join('node_modules', '.bin', binName))
        |> () => outputFile(
          P.join('node_modules', '.bin', binName),
          endent`
            #!/usr/bin/env node

            require('../../${replacedFilename}')
          `,
        )
        |> await
        |> () => chmod(P.join('node_modules', '.bin', binName), '755')
    })
    |> values
    |> Promise.all
    |> await
}
