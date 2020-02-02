import outputFiles from 'output-files'
import getNewFiles from './get-new-files'
import { spawn } from 'child-process-promise'
import workspaceGlob from './workspace-glob'

export default async () => {
  getNewFiles() |> await |> outputFiles
  if (workspaceGlob !== undefined) {
    return spawn('wsrun', ['--stages', '--bin', require.resolve('./run-command.cli'), '-c', 'prepare'], { stdio: 'inherit' })
  }
}