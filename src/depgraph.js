import execa from 'execa'

export default ({ log = true } = {}) =>
  execa.command('depgraph', { stdio: log ? 'inherit' : 'pipe' })