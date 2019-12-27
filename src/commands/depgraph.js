import { spawn } from 'child-process-promise'

export default {
  handler: () => spawn('depgraph', [], { stdio: 'inherit' }),
}
