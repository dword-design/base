#!/usr/bin/env node

const findUp = require('find-up')
const resolveBin = require('resolve-bin')
const { resolve } = require('path')
const { fork } = require('child-process-promise')
const yesSir = require('@dword-design/yes-sir')

yesSir({
  args: '[filenames...]',
  action: filenames => findUp('.gitignore')
    .then(gitignorePath => fork(
      resolveBin.sync('eslint'),
      [
        ...filenames.length > 0 ? filenames : ['.'],
        '--config', resolve(__dirname, 'eslintrc.js'),
        ...gitignorePath !== undefined ? ['--ignore-path', gitignorePath] : [],
        '--resolve-plugins-relative-to', __dirname,
        '--ext', '.js,.vue',
      ],
    ))
      .catch(({ name, code }) => name === 'ChildProcessError' && process.exit(code)),
})
