import P from 'path'

import rawConfig from './raw-config'

export default filePath =>
  (filePath |> P.basename) === 'package.json' &&
  rawConfig.name !== '@dword-design/base-config-node'
    ? [rawConfig.name]
    : []
