import config from '../config'

export default [
  '.DS_Store',
  '/.cz.json',
  '/.editorconfig',
  '/.env',
  '/.nyc_output',
  '/.releaserc.json',
  '/.vscode',
  '/coverage',
  '/dist',
  '/node_modules',
  ...config.gitignore ?? [],
]