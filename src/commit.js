import { spawn } from 'child-process-promise'

export default () => spawn('git-cz', [], { stdio: 'inherit' })
