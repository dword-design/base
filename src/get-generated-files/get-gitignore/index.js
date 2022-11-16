import { identity, sortBy } from '@dword-design/functions'

import commonGitignore from '@/src/get-generated-files/common-gitignore.json'

export default config => [...commonGitignore, ...config.gitignore] |> sortBy(identity)
