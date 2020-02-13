import { endent } from '@dword-design/functions'
import getPackageName from 'get-package-name'

export default endent`
  {
    "path": "${getPackageName(require.resolve('cz-conventional-changelog'))}"
  }

`