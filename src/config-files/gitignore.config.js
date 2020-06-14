import config from '../config'
import commonGitignore from './common-gitignore.json'

export default [...commonGitignore, ...(config.gitignore || [])]
