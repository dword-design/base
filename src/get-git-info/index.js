import { exists } from 'fs-extra'
import hostedGitInfo from 'hosted-git-info'
import parseGitConfig from 'parse-git-config'

export default async () => {
  const gitUrl = exists('.git')
    ? (await parseGitConfig())['remote "origin"']?.url
    : undefined

  const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {}
  if (gitUrl !== undefined && gitInfo.type !== 'github') {
    throw new Error('Only GitHub repositories are supported.')
  }
  return gitUrl ? gitInfo : undefined
}