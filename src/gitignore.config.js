import config from '@dword-design/base-config'

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
