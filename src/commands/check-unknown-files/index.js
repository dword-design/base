import { filter, fromPairs, keys, map } from '@dword-design/functions'
import globby from 'globby'
import ignore from 'ignore'

import commonAllowedMatches from './common-allowed-matches.js'
import UnknownFilesError from './unknown-files-error.js'

export default async function () {
  const allowedMatches = [
    ...(this.generatedFiles |> keys),
    ...commonAllowedMatches,
    ...this.config.allowedMatches,
  ]

  const unknownFiles =
    globby('**', { dot: true, gitignore: true, ignore: allowedMatches })
    |> await
    |> filter(ignore().add(this.getGitignoreConfig()).createFilter())
  if (unknownFiles.length > 0) {
    throw new UnknownFilesError(
      unknownFiles |> map(file => [file, true]) |> fromPairs
    )
  }
}
