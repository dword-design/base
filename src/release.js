import { spawn } from 'child-process-promise'

export default () => spawn('semantic-release', [], { stdio: 'inherit' })
