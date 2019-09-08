#!/usr/bin/env node

const yesSir = require('@dword-design/yes-sir')
const { fork } = require('child-process-promise')
const { chain } = require('lodash')
const findUp = require('find-up')
const { dirname, resolve } = require('path')
const allSettled = require('./all-settled')

yesSir({
  args: '[filenames...]',
  action: filenames => allSettled(
    chain(filenames)
      .groupBy(filename => dirname(findUp.sync('package.json', { cwd: dirname(filename) })))
      .mapValues((filenames, packageDirectory) => fork(resolve(__dirname, 'eslint.js'), filenames, { cwd: packageDirectory }))
      .values()
      .value(),
  )
    .catch(error => {
      if (error.name === 'ChildProcessError') {
        process.exit(error.code)
      } else {
        throw error
      }
    }),
})
