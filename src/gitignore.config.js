import config from './config'

export default [
  '.DS_Store',
  '/.editorconfig',
  '/.env',
  '/.nyc_output',
  '/.vscode',
  '/coverage',
  '/dist',
  '/node_modules',
  ...config.gitignore ?? [],
]
