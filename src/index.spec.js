import execa from 'execa'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  'commit message without type': () =>
    withLocalTmpDir(async () => {
      let output
      try {
        await execa.command('git commit --allow-empty -m foo', { all: true })
      } catch (error) {
        output = error.all
      }
      expect(output).toMatch('subject may not be empty [subject-empty]')
      expect(output).toMatch('type may not be empty [type-empty]')
    }),
}
