import { endent } from '@dword-design/functions'
import getPackageName from 'get-package-name'

export default endent`
  {
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "${getPackageName(require.resolve('@semantic-release/changelog'))}",
      "${getPackageName(require.resolve('@semantic-release/github'))}",
      "${getPackageName(require.resolve('@semantic-release/npm'))}",
      "${getPackageName(require.resolve('@semantic-release/git'))}"
    ]
  }

`