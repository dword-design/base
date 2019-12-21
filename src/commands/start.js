import { spawn } from 'child-process-promise'
import workspaceGlob from '../workspace-glob'
import { map, promiseAll, first } from '@dword-design/functions'
import config from '../config'
import glob from 'glob-promise'
import buildConfigFiles from '../build-config-files'

export default {
  handler: async () => {
    await buildConfigFiles()
    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first, { dot: true })
        |> await
        |> map(path => spawn('npm', ['start'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : config.start()
  },
}
