import { endent } from '@functions'
import { exists, outputFile, readFile, remove } from 'fs'
import { join, resolve } from 'path'

const identifier = '# base'

export const register = async () => {
  if (await exists('.git')
    && (
      !await exists(join(process.cwd(), '.git', 'hooks', 'pre-commit'))
      || (await readFile(resolve('.git', 'hooks', 'pre-commit'), 'utf8')).includes(identifier)
    )
  ) {
    console.log('Registering git hooks …')
    await outputFile(
      join(process.cwd(), '.git', 'hooks', 'pre-commit'),
      endent`
        ${identifier}
        exec npm test
      `,
      { encoding: 'utf8', mode: '755' },
    )
  }
}

export const unregister = async () => {
  if (await exists('.git')
    && await exists(join(process.cwd(), '.git', 'hooks', 'pre-commit'))
    && (await readFile(resolve('.git', 'hooks', 'pre-commit'), 'utf8')).includes(identifier)
  ) {
    console.log('Unregistering git hooks …')
    await remove(resolve('.git', 'hooks', 'pre-commit'))
  }
}
