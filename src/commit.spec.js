import withLocalTmpDir from 'with-local-tmp-dir'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import pEvent from 'p-event'

const commit = async (args = []) => {
  const childProcess = execa(require.resolve('./cli'), ['commit', ...args])
  await pEvent(childProcess.stdout, 'data', data =>
    data.toString().includes('Select the type of change')
  )
  childProcess.stdin.write('\n')
  await pEvent(childProcess.stdout, 'data', data =>
    data.toString().includes('What is the scope of this change')
  )
  childProcess.stdin.write('config\n')
  await pEvent(childProcess.stdout, 'data', data =>
    data.toString().includes('Write a short, imperative tense description')
  )
  childProcess.stdin.write('foo bar\n')
  await pEvent(childProcess.stdout, 'data', data =>
    data.toString().includes('Provide a longer description')
  )
  childProcess.stdin.write('\n')
  await pEvent(childProcess.stdout, 'data', data =>
    data.toString().includes('Are there any breaking changes')
  )
  childProcess.stdin.write('\n')
  await pEvent(childProcess.stdout, 'data', data =>
    data.toString().includes('Does this change affect any open issues')
  )
  childProcess.stdin.write('\n')
  await childProcess
}

export default {
  valid: () =>
    withLocalTmpDir(async () => {
      await execa.command('git config --global user.email "foo@bar.de"')
      await execa.command('git config --global user.name "foo"')
      await execa.command('git init')
      await outputFile('foo.txt', '')
      await execa.command('git add .')
      await commit()
      const { stdout } = await execa.command('git log')
      expect(stdout).toMatch('feat(config): foo bar')
    }),
  'allow-empty': () =>
    withLocalTmpDir(async () => {
      await execa.command('git config --global user.email "foo@bar.de"')
      await execa.command('git config --global user.name "foo"')
      await execa.command('git init')
      await commit(['--allow-empty'])
      const { stdout } = await execa.command('git log')
      expect(stdout).toMatch('feat(config): foo bar')
    }),
}
