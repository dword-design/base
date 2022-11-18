import { existsSync } from 'fs-extra'
import hostedGitInfo from 'hosted-git-info'
import parseGitConfig from 'parse-git-config'

export default () => {
  if (!existsSync('.git')) {
    return undefined
  }

  const gitUrl = parseGitConfig.sync()['remote "origin"']?.url
  if (gitUrl === undefined) {
    return undefined
  }

  const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {}
  if (gitInfo.type !== 'github') {
    throw new Error('Only GitHub repositories are supported.')
  }

  return gitInfo
}
