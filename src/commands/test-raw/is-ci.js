import { execaCommandSync } from 'execa'

export default () => {
  try {
    execaCommandSync('is-ci')

    return true
  } catch {
    return false
  }
}
