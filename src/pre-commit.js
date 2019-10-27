const endent = require('endent')
const { exists, outputFile, readFile, remove } = require('fs-extra')
const P = require('path')
const initCwd = require('./init-cwd')

const identifier = '# base'

exports.register = async () => {
  if (await exists(P.join(initCwd(), '.git'))
    && (
      !await exists(P.join(initCwd(), '.git/hooks/pre-commit'))
      || (await readFile(P.resolve(initCwd(), '.git/hooks/pre-commit'), 'utf8')).includes(identifier)
    )
  ) {
    console.log('Registering git hooks …')
    await outputFile(
      P.join(initCwd(), '.git/hooks/pre-commit'),
      endent`
        ${identifier}
        exec npm test
      `,
      { encoding: 'utf8', mode: '755' },
    )
  }
}

exports.unregister = async () => {
  if (await exists(P.join(initCwd(), '.git/hooks/pre-commit'))
    && (await readFile(P.resolve(initCwd(), '.git/hooks/pre-commit'), 'utf8')).includes(identifier)
  ) {
    console.log('Unregistering git hooks …')
    await remove(P.resolve(initCwd(), '.git/hooks/pre-commit'))
  }
}
