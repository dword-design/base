import execa from 'execa'

export default ({ allowEmpty, noVerify }) => execa(
  'git-cz',
  [
    ...allowEmpty ? ['--allow-empty'] : [],
    ...noVerify ? ['--no-verify'] : [],
  ],
  { stdio: 'inherit' },
)
