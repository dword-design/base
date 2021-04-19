import { endent, fromPairs, map } from '@dword-design/functions'

import self from './unknown-files-error.mjs'

export default {
  works: () => {
    expect(
      new self(['foo.txt', 'bar.txt'] |> map(file => [file, true]) |> fromPairs)
        .message
    ).toEqual(endent`
      There are files in this repository that are not known to @dword-design/base. Let's discuss about them in a PR!
      
      * bar.txt
      * foo.txt
    `)
  },
}
