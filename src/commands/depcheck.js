import { join, map, omit } from '@dword-design/functions'
import depcheck from 'depcheck'

const processResult = (caption, deps) => {
  if (deps.length > 0) {
    throw new Error(
      [caption, ...(deps |> map(dep => `* ${dep}`))] |> join('\n')
    )
  }
}

export default async function () {
  let result = await depcheck('.', {
    package: this.config.package |> omit(['devDependencies']),
    skipMissing: true,
    ...this.config.depcheckConfig,
    ignorePatterns: ['*.spec.js', 'package.json'],
  })
  processResult('Unused dependencies', result.dependencies)
  result = await depcheck('.', {
    package: this.config.package |> omit(['dependencies']),
    skipMissing: true,
    ...this.config.depcheckConfig,
    ignorePatterns: ['!*.spec.js'],
  })
  processResult('Unused devDependencies', result.devDependencies)
}
