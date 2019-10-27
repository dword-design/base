const endent = require('endent')
const { exists, outputFile, readFile, remove } = require('fs-extra')
const P = require('path')

const isSelf = () => require(P.resolve(process.env.INIT_CWD, 'package.json')).name === require('../package.json').name

const identifier = '# base'

exports.register = async () => {
  if (!isSelf()
    && await exists(P.join(process.env.INIT_CWD, '.git'))
    && (
      !await exists(P.join(process.env.INIT_CWD, '.git/hooks/pre-commit'))
      || (await readFile(P.resolve(process.env.INIT_CWD, '.git/hooks/pre-commit'), 'utf8')).includes(identifier)
    )
  ) {
    console.log('Registering git hooks …')
    await outputFile(
      P.join(process.env.INIT_CWD, '.git/hooks/pre-commit'),
      endent`
        ${identifier}
        exec npx base pre-commit
      `,
      { encoding: 'utf8', mode: '755' },
    )
  }
}

exports.unregister = async () => {
  if (!isSelf()
    && await exists(P.join(process.env.INIT_CWD, '.git/hooks/pre-commit'))
    && (await readFile(P.resolve(process.env.INIT_CWD, '.git/hooks/pre-commit'), 'utf8')).includes(identifier)
  ) {
    console.log('Unregistering git hooks …')
    await remove(P.resolve(process.env.INIT_CWD, '.git/hooks/pre-commit'))
  }
}
