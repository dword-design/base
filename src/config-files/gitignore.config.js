import config from '../config'

export default [
  '.DS_Store',
  '/.cz.json',
  '/.editorconfig',
  '/.env.json',
  '/.nyc_output',
  '/.releaserc.json',
  '/.vscode',
  '/coverage',
  '/dist',
  '/node_modules',
  ...config.gitignore ?? [],
]