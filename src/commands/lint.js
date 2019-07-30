const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const { spawn } = require('child-process-promise')
const findRootPath = require('../find-root-path')
const findBasePath = require('../find-base-path')

module.exports = {
  name: 'lint',
  description: 'Outputs linting errors',
  handler: () => Promise.all([findRootPath(), findBasePath()])
    .then(([rootPath, basePath]) => spawn(
      path.resolve(basePath, 'node_modules/.bin/eslint'),
      [
        '.',
        '--config', path.resolve(basePath, 'src/eslintrc.js'),
        '--ignore-path', path.resolve(rootPath, '.gitignore'),
        '--ext', '.js,.vue',
      ],
      { stdio: 'inherit' },
    )),
  isEnabled: nodeEnv === 'development',
}
