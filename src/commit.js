import execa from 'execa'

export default ({ allowEmpty }) => execa(
  'git-cz',
  allowEmpty ? ['--allow-empty'] : [],
  { stdio: 'inherit' },
)
