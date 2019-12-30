import { spawn } from 'child-process-promise'
import workspaceGlob from '../workspace-glob'
import { map, promiseAll, first, trim } from '@dword-design/functions'
import config from '@dword-design/base-config'
import glob from 'glob-promise'

export default {
  handler: async () => {
    try {
      await spawn('config-files', [], { capture: ['stdout'] })
    } catch (error) {
      throw new Error(error.stdout |> trim)
    }
    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first)
        |> await
        |> map(path => spawn('base', ['start'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : config.start()
  },
}
