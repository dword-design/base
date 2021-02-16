import {
  endent,
  identity,
  join,
  keys,
  map,
  sortBy,
} from '@dword-design/functions'

import packageConfig from '@/package.json'

export default class extends Error {
  constructor(files) {
    super(endent`
      There are files in this repository that are not known to ${
        packageConfig.name
      }. Let's discuss about them in a PR!
      
      ${
        files
        |> keys
        |> map(file => `* ${file}`)
        |> sortBy(identity)
        |> join('\n')
      }
    `)
  }
}
