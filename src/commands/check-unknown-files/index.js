import {
  filter,
  first,
  keys,
  map,
  split,
  zipObject,
} from '@dword-design/functions'
import globby from 'globby'
import ignore from 'ignore'

import config from '@/src/config'
import configFiles from '@/src/generated-files'
import gitignoreConfig from '@/src/generated-files/gitignore'

import commonAllowedMatches from './common-allowed-matches.json'
import UnknownFilesError from './unknown-files-error'

const allowedMatches = [
  ...(configFiles |> keys |> map(path => path |> split('/') |> first)),
  ...commonAllowedMatches,
  ...(config.allowedMatches || []),
]

export default async () => {
  const unknownFiles =
    globby('*', { dot: true, ignore: allowedMatches, onlyFiles: false })
    |> await
    |> filter(ignore().add(gitignoreConfig).createFilter())
  if (unknownFiles.length > 0) {
    throw new UnknownFilesError(
      zipObject(unknownFiles, unknownFiles |> map(() => true))
    )
  }
}
