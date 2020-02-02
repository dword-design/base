import configName from './config-name'
import P from 'path'

export default filePath => (filePath |> P.basename) === 'package.json' && configName !== '@dword-design/base-config-node'
  ? [configName]
  : []