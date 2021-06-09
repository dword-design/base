import { isEmpty, join, map } from '@dword-design/functions'
import depcheck from 'depcheck'

import packageConfig from '@/src/package-config'

import config from './config'

const noIssue = result =>
  isEmpty(result.dependencies) &&
  isEmpty(result.devDependencies) &&
  isEmpty(result.missing)

const prettify = (caption, deps) => {
  const list = deps |> map(dep => `* ${dep}`)

  return list.length ? [caption].concat(list) : []
}

export default async () => {
  const result = await depcheck('.', {
    package: packageConfig,
    skipMissing: true,
    ...config,
  })
  if (!noIssue(result)) {
    throw new Error(
      [
        ...prettify('Unused dependencies', result.dependencies),
        ...prettify('Unused devDependencies', result.devDependencies),
      ] |> join('\n')
    )
  }
}
