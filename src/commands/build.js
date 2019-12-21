import { spawn } from 'child-process-promise'
import glob from 'glob-promise'
import workspaceGlob from '../workspace-glob'
import { first, map, promiseAll } from '@dword-design/functions'
import config from '../config'
import buildConfigFiles from '../build-config-files'

export default {
  handler: async () => {
    await buildConfigFiles()
    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first, { dot: true })
        |> await
        |> map(path => spawn('npm', ['run', 'prepublishOnly'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : config.build()
  },
}
