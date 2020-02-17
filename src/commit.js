import execa from 'execa'

export default ({ allowEmpty, verify }) => execa(
  'git-cz',
  [
    ...allowEmpty ? ['--allow-empty'] : [],
    ...verify ? [] : ['--no-verify'],
  ],
  { stdio: 'inherit' },
)
