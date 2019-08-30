const nodeEnv = require('@dword-design/node-env')
const { resolve } = require('path')
const { spawn } = require('child-process-promise')
const findUp = require('find-up')
const resolveBin = require('resolve-bin')

module.exports = {
  name: 'lint',
  description: 'Outputs linting errors',
  handler: () => findUp('.gitignore')
    .then(gitignorePath => spawn(
      resolveBin.sync('eslint'),
      [
        '.',
        '--config', resolve(__dirname, '../eslintrc.js'),
        ...gitignorePath !== undefined ? ['--ignore-path', gitignorePath] : [],
        '--resolve-plugins-relative-to', __dirname,
        '--ext', '.js,.vue',
      ],
      { stdio: 'inherit' },
    )),
  isEnabled: nodeEnv === 'development',
}
