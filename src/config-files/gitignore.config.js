import config from '../config'

export default [
  '.DS_Store',
  '/.babelrc.json',
  '/.cz.json',
  '/.editorconfig',
  '/.env.json',
  '/.test.env.json',
  '/.nyc_output',
  '/.releaserc.json',
  '/.vscode',
  '/coverage',
  '/dist',
  '/node_modules',
  ...(config.gitignore ?? []),
]
