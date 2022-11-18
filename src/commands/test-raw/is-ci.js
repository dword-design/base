import execa from 'execa'

export default async () => {
  try {
    await execa.command('is-ci')

    return true
  } catch {
    return false
  }
}
