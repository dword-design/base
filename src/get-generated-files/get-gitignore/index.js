import { identity, sortBy } from '@dword-design/functions'

import commonGitignore from '@/src/get-generated-files/common-gitignore.js'

export default function () {
  return [...commonGitignore, ...this.config.gitignore] |> sortBy(identity)
}
