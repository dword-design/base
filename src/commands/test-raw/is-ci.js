import execa from 'execa'

export default () => {
  try {
    execa.commandSync('is-ci')

    return true
  } catch {
    return false
  }
}
