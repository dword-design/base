import P from 'path'

import packageBaseConfig from './package-base-config'

export default filePath =>
  (filePath |> P.basename) === 'package.json' &&
  packageBaseConfig.name !== '@dword-design/base-config-node'
    ? [packageBaseConfig.name]
    : []
