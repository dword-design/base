import { endent } from '@functions'
import { exists, outputFile, readFile, remove } from 'fs'
import { join, resolve } from 'path'
import findUp from 'find-up'

const identifier = '# base'

export const register = async () => {
  const gitPath = await findUp('.git', { type: 'directory' })
  if (gitPath !== undefined
    && (
      !await exists(join(gitPath, 'hooks', 'pre-commit'))
      || (await readFile(resolve(gitPath, 'hooks', 'pre-commit'), 'utf8')).includes(identifier)
    )
  ) {
    console.log('Registering git hooks …')
    await outputFile(
      join(gitPath, 'hooks', 'pre-commit'),
      endent`
        ${identifier}
        exec npm test
      `,
      { encoding: 'utf8', mode: '755' },
    )
  }
}

export const unregister = async () => {
  const gitPath = await findUp('.git', { type: 'directory' })
  if (gitPath !== undefined
    && await exists(join(gitPath, 'hooks', 'pre-commit'))
    && (await readFile(resolve(gitPath, 'hooks', 'pre-commit'), 'utf8')).includes(identifier)
  ) {
    console.log('Unregistering git hooks …')
    await remove(resolve(gitPath, 'hooks', 'pre-commit'))
  }
}
