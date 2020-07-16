import { filter, first, keys, map, split, unary } from '@dword-design/functions'
import { remove } from 'fs-extra'
import globby from 'globby'
import ignore from 'ignore'

import commonAllowedMatches from './common-allowed-matches.json'
import config from './config'
import configFiles from './generated-files'
import gitignoreConfig from './generated-files/gitignore.config'

const allowedMatches = [
  ...(configFiles |> keys |> map(path => path |> split('/') |> first)),
  ...commonAllowedMatches,
  ...(config.allowedMatches || []),
]

export default async () =>
  globby('*', { dot: true, ignore: allowedMatches, onlyFiles: false })
  |> await
  |> filter(ignore().add(gitignoreConfig).createFilter())
  |> map(unary(remove))
  |> Promise.all
