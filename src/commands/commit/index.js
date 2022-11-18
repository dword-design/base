import execa from 'execa'

export default (options = {}) =>
  execa('git-cz', [...(options.allowEmpty ? ['--allow-empty'] : [])], {
    stdio: options.log === false ? 'pipe' : 'inherit',
  })
