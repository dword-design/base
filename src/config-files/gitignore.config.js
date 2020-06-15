import config from '@/src/config'

import commonGitignore from './common-gitignore.json'

export default [...commonGitignore, ...(config.gitignore || [])]
