import config from './config'
import { map, join } from '@functions'

export default [
  '.DS_Store',
  '/.editorconfig',
  '/.nyc_output',
  '/.vscode',
  '/coverage',
  '/dist',
  '/node_modules',
  ...config.gitignore ?? [],
]
  |> map(entry => `${entry}\n`)
  |> join('')
