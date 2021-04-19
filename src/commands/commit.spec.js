import { mapValues } from '@dword-design/functions'
import execa from 'execa'
import fs from 'fs-extra'
import pEvent from 'p-event'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from './commit.mjs'

const runTest = options => () =>
  withLocalTmpDir(async () => {
    await fs.outputFile('foo.txt', '')
    await execa.command('git init')
    await execa.command('git config user.email "foo@bar.de"')
    await execa.command('git config user.name "foo"')
    await execa.command('git add .')

    const childProcess = self({ ...options, log: false })
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

    const output = await execa.command('git log')
    expect(output.stdout).toMatch('feat(config): foo bar')
  })

export default {
  'allow-empty': { allowEmpty: true },
  valid: [],
} |> mapValues(runTest)
