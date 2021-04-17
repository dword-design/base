import { existsSync } from 'fs-extra'
import hostedGitInfo from 'hosted-git-info'
import parseGitConfig from 'parse-git-config'

const gitUrl = existsSync('.git')
  ? parseGitConfig.sync()['remote "origin"']?.url
  : undefined

const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {}
if (gitUrl !== undefined && gitInfo.type !== 'github') {
  throw new Error('Only GitHub repositories are supported.')
}

export default gitUrl ? gitInfo : undefined
