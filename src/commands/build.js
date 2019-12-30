import { spawn } from 'child-process-promise'
import glob from 'glob-promise'
import workspaceGlob from '../workspace-glob'
import { first, map, promiseAll } from '@dword-design/functions'
import config from '@dword-design/base-config'

export default {
  handler: async () => {
    await spawn('config-files', [], { stdio: 'inherit' })
    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first)
        |> await
        |> map(path => spawn('base', ['build'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : config.build()
  },
}
