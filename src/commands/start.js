import { spawn } from 'child-process-promise'
import workspaceGlob from '../workspace-glob'
import { map, promiseAll, first } from '@dword-design/functions'
import config from '@dword-design/base-config'
import glob from 'glob-promise'
import buildConfigFiles from '../build-config-files'

export default {
  handler: async () => {
    await buildConfigFiles()
    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first)
        |> await
        |> map(path => spawn('base', ['start'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : config.start()
  },
}
