const endent = require('endent')
const { exists, outputFile, readFile } = require('fs-extra')
const P = require('path')

const isSelf = require(P.resolve('package.json')).name === require('../package.json').name

const gitHookIdentifier = '# base'

exports.register = async () => {
  if (!isSelf
    && await exists('.git')
    && (
      !await exists('.git/hooks/pre-commit')
      || (await readFile('.git/hooks/pre-commit', 'utf8')).includes(gitHookIdentifier)
    )
  ) {
    console.log('Registering git hooks …')
    await outputFile(
      '.git/hooks/pre-commit',
      endent`
        ${gitHookIdentifier}
        exec npx base pre-commit
      `,
      { encoding: 'utf8', mode: '755' },
    )
  }
}

exports.unregister = async () => {
  if (!isSelf && await exists('.git/hooks/pre-commit') && (await readFile('.git/hooks/pre-commit', 'utf8')).includes(gitHookIdentifier)) {
    console.log('Unregistering git hooks …')
    await remove('.git/hooks/pre-commit')
  }
}
