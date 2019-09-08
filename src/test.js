#!/usr/bin/env node

const { spawn, fork } = require('child-process-promise')
const { relative, resolve, join } = require('path')
const resolveBin = require('resolve-bin')
const glob = require('glob-promise')
const babel = require('@babel/core')
const { map } = require('lodash')
const { outputFile, remove } = require('fs-extra')
const build = require('./commands/build')

Promise.resolve()
  .then(() => build.handler())
  .then(() => console.log('Compiling tests …'))
  .then(() => remove('dist-test'))
  .then(() => glob('**/*.js', { cwd: 'test' }))
  .then(filenames => Promise.all(
    map(filenames, filename => babel
      .transformFileAsync(join('test', filename), { configFile: require.resolve('./babel.config') })
      .then(({ code }) => outputFile(join('dist-test', filename), code))
    )
  ))
  .then(() => glob('(dist|dist-test)/**/*.test.js', { ignore: ['**/*.docker.test.js'] })
    .then(filenames => filenames.length > 0
      ? fork(
        resolveBin.sync('jasmine'),
        [
          `--helper=${require.resolve('./jasmine-helper')}`,
          '(dist|dist-test)/**/*.test.js',
          '!**/*.docker.test.js',
          '!node_modules/**',
        ],
      )
      // ? fork(
      //   resolveBin.sync('jest'),
      //   [
      //     '\.test\.js$',
      //     '--testPathIgnorePatterns', '\.docker\.test\.js$',
      //     '--transform', `{"\.js":"${require.resolve('./jest-transformer')}"}`,
      //     '--globalSetup', require.resolve('./jest-global-setup'),
      //     '--globalTeardown', require.resolve('./jest-global-teardown'),
      //   ],
      // )
      : undefined
    )
  )
  .then(() => glob('+(dist|dist-test)/**/*.docker.test.js')
    .then(filenames => filenames.length > 0
      ? Promise.resolve()
        .then(() => console.log('Starting docker container …'))
        .then(() => spawn(
          'docker',
          [
            'run',
            '-e', 'NODE_ENV=production',
            '-u', 'node',
            '-v', `${process.cwd()}:/var/www:delegated`,
            '-w', '/var/www',
            '--rm',
            'node:alpine',
            relative(process.cwd(), resolveBin.sync('jasmine')),
            `--helper=${relative(process.cwd(), require.resolve('./jasmine-helper'))}`,
            '+(dist|dist-test)/**/*.docker.test.js',
            '!node_modules/**',
          ],
          { stdio: 'inherit' },
        ))
        // .then(() => spawn(
        //   'docker',
        //   [
        //     'run',
        //     '-e', 'NODE_ENV=production',
        //     '-u', 'node',
        //     '-v', `${process.cwd()}:/var/www`,
        //     '-w', '/var/www',
        //     '--rm',
        //     'node:alpine',
        //     relative(process.cwd(), resolveBin.sync('jest')),
        //     '\.docker\.test\.js$',
        //     '--transform', `{"\.js":"<rootDir>/${relative(process.cwd(), require.resolve('./jest-transformer'))}"}`,
        //     '--globalSetup', `<rootDir>/${relative(process.cwd(), require.resolve('./jest-global-setup'))}`,
        //     '--globalTeardown', `<rootDir>/${relative(process.cwd(), require.resolve('./jest-global-teardown'))}`,
        //   ],
        //   { stdio: 'inherit' },
        // ))
      : undefined
    )
  )
  .catch(error => {
    if (error.name === 'ChildProcessError') {
      process.exit(error.code)
    } else {
      throw error
    }
  })
