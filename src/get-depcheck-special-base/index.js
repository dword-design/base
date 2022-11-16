import P from 'path'

export default rawConfig => filePath =>
  (filePath |> P.basename) === 'package.json' &&
  rawConfig.name !== '@dword-design/base-config-node'
    ? [rawConfig.name]
    : []
