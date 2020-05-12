import commonGitignore from './common-gitignore.json'
import config from '../config'

export default [...commonGitignore, ...(config.gitignore || [])]
