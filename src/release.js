import execa from 'execa'

export default () => execa.command('semantic-release', { stdio: 'inherit' })
