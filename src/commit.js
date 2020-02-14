import execa from 'execa'

export default () => execa.command('git-cz', { stdio: 'inherit' })
