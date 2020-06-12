import execa from 'execa'

export default options =>
  execa(
    'git-cz',
    [
      ...(options.allowEmpty ? ['--allow-empty'] : []),
      ...(options.verify ? [] : ['--no-verify']),
    ],
    { stdio: 'inherit' }
  )
