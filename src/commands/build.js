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
      //spawn('yarn', ['workspaces', 'run', 'prepublishOnly'], { stdio: 'inherit' })
      ? spawn('wsrun', ['--stages', '--bin', 'npx', '-c', 'base', 'build'], { stdio: 'inherit' })
      //glob(workspaceGlob |> first)
      //|> await
      //|> map(path => spawn('base', ['build'], { cwd: path, stdio: 'inherit' }))
      //|> promiseAll
      : config.build()
  },
}
