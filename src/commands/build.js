import { spawn } from 'child-process-promise'
import glob from 'glob-promise'
import workspaceGlob from '../workspace-glob'
import { first, map, promiseAll } from '@dword-design/functions'
import config from '@dword-design/base-config'
import buildConfigFiles from '../build-config-files'

export default {
  handler: async () => {
    await buildConfigFiles()
    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first)
        |> await
        |> map(path => spawn('base', ['build'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : config.build()
  },
}
