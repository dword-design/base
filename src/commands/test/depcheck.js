import { join, map, omit } from '@dword-design/functions'
import depcheck from 'depcheck'

import config from '@/src/config'
import packageConfig from '@/src/package-config'

const processResult = (caption, deps) => {
  if (deps.length > 0) {
    throw new Error(
      [caption, ...(deps |> map(dep => `* ${dep}`))] |> join('\n')
    )
  }
}

export default async () => {
  let result = await depcheck('.', {
    package: packageConfig |> omit(['devDependencies']),
    skipMissing: true,
    ...config.depcheckConfig,
    ignorePatterns: ['*.spec.js', 'package.json'],
  })
  processResult('Unused dependencies', result.dependencies)
  result = await depcheck('.', {
    package: packageConfig |> omit(['dependencies']),
    skipMissing: true,
    ...config.depcheckConfig,
    ignorePatterns: ['!*.spec.js'],
  })
  processResult('Unused devDependencies', result.devDependencies)
}
