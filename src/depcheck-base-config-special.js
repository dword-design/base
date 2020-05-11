import P from 'path'
import configName from './config-name'

export default filePath =>
  (filePath |> P.basename) === 'package.json' &&
  configName !== '@dword-design/base-config-node'
    ? [configName]
    : []
