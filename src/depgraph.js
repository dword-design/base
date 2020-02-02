import { spawn } from 'child-process-promise'

export default ({ stdio = 'inherit' } = {}) => spawn('depgraph', [], { stdio })