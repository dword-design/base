import { spawn } from 'child-process-promise'

export default ({ log = true } = {}) =>
  spawn('depgraph', [], { stdio: log ? 'inherit' : 'pipe' })