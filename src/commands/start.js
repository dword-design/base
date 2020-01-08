import { spawn } from 'child-process-promise'
import workspaceGlob from '../workspace-glob'
import { trim } from '@dword-design/functions'
import config from '@dword-design/base-config'

export default {
  handler: async () => {
    try {
      await spawn('config-files', [], { capture: ['stdout'] })
    } catch (error) {
      throw new Error(error.stdout |> trim)
    }
    return workspaceGlob !== undefined
      ? spawn('wsrun', ['--bin', 'npx', '-c', 'base', 'start'], { stdio: 'inherit' })
      : config.start()
  },
}
