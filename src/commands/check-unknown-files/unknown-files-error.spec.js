import { endent } from '@dword-design/functions'

import self from './unknown-files-error'

export default {
  works: () => {
    expect(new self({ 'bar.txt': true, 'foo.txt': true }).message)
      .toEqual(endent`
      There are files in this repository that are not known to @dword-design/base. Let's discuss about them in a PR!
      
      * foo.txt
      * bar.txt
    `)
  },
}
