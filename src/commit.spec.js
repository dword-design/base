import withLocalTmpDir from 'with-local-tmp-dir'
import execa from 'execa'
import { outputFile, chmod } from 'fs-extra'
import pEvent from 'p-event'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'

const commit = async (args = []) => {

  const childProcess = execa(require.resolve('./cli'), ['commit', ...args])
  await pEvent(
    childProcess.stdout,
    'data',
    data => data.toString().includes('Select the type of change'),
  )
  childProcess.stdin.write('\n')
  await pEvent(
    childProcess.stdout,
    'data',
    data => data.toString().includes('What is the scope of this change'),
  )
  childProcess.stdin.write('config\n')
  await pEvent(
    childProcess.stdout,
    'data',
    data => data.toString().includes('Write a short, imperative tense description'),
  )
  childProcess.stdin.write('foo bar\n')
  await pEvent(
    childProcess.stdout,
    'data',
    data => data.toString().includes('Provide a longer description'),
  )
  childProcess.stdin.write('\n')
  await pEvent(
    childProcess.stdout,
    'data',
    data => data.toString().includes('Are there any breaking changes'),
  )
  childProcess.stdin.write('\n')
  await pEvent(
    childProcess.stdout,
    'data',
    data => data.toString().includes('Does this change affect any open issues'),
  )
  childProcess.stdin.write('\n')
  await childProcess
}

export default {
  valid: () => withLocalTmpDir(async () => {
    await execa.command('git config --global user.email "foo@bar.de"')
    await execa.command('git config --global user.name "foo"')
    await execa.command('git init')
    await outputFile('foo.txt', '')
    await execa.command('git add .')
    await commit()
    const { stdout } = await execa.command('git log')
    expect(stdout).toMatch('feat(config): foo bar')
  }),
  'no-verify': () => withLocalTmpDir(async () => {
    await execa.command('git config --global user.email "foo@bar.de"')
    await execa.command('git config --global user.name "foo"')
    await execa.command('git init')
    await outputFiles({
      '.git/hooks/pre-commit': endent`
        #!/usr/bin/env node

        process.exit(1)
      `,
      'foo.txt': '',
    })
    await chmod('.git/hooks/pre-commit', '755')
    await execa.command('git add .')
    await commit(['--no-verify'])
  }),
  'allow-empty': () => withLocalTmpDir(async () => {
    await execa.command('git config --global user.email "foo@bar.de"')
    await execa.command('git config --global user.name "foo"')
    await execa.command('git init')
    await commit(['--allow-empty'])
    const { stdout } = await execa.command('git log')
    expect(stdout).toMatch('feat(config): foo bar')
  }),
}