import { endsWith, map, slice } from '@dword-design/functions'

import config from './config'
import depcheckConfig from './depcheck.config'

export default {
  ...depcheckConfig,
  ignoreDirs: [
    ...depcheckConfig.ignoreDirs,
    ...(config.packageConfig?.workspaces || []
      |> map(workspace =>
        workspace |> endsWith('/*') ? workspace |> slice(0, -2) : workspace
      )),
  ],
}
