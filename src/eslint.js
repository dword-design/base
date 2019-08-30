const findUp = require('find-up')
const resolveBin = require('resolve-bin')
const { resolve } = require('path')
const { spawn } = require('child-process-promise')

findUp('.gitignore')
  .then(gitignorePath => spawn(
    resolveBin.sync('eslint'),
    [
      '.',
      '--config', resolve(__dirname, 'eslintrc.js'),
      ...gitignorePath !== undefined ? ['--ignore-path', gitignorePath] : [],
      '--resolve-plugins-relative-to', __dirname,
      '--ext', '.js,.vue',
    ],
    { stdio: 'inherit' },
  ))
