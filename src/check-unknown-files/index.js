import { filter, fromPairs, keys, map } from '@dword-design/functions'
import globby from 'globby'
import ignore from 'ignore'
import commonAllowedMatches from './common-allowed-matches.json'
import UnknownFilesError from './unknown-files-error'

export default async config => {
  const allowedMatches = [
    ...(config.generatedFiles |> keys),
    ...commonAllowedMatches,
    ...config.allowedMatches,
  ]
  const unknownFiles =
    globby('**', { dot: true, gitignore: true, ignore: allowedMatches })
    |> await
    |> filter(ignore().add(config.generatedFiles.gitignoreConfig).createFilter())
  if (unknownFiles.length > 0) {
    throw new UnknownFilesError(
      unknownFiles |> map(file => [file, true]) |> fromPairs
    )
  }
}
