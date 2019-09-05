#!/usr/bin/env node

const { spawn, fork } = require('child-process-promise')
const { relative, resolve } = require('path')
const resolveBin = require('resolve-bin')
const glob = require('glob-promise')

Promise.resolve()
  .then(() => glob('**/*.test.js', { ignore: ['**/*.docker.test.js', '**/node_modules/**'] })
    .then(filenames => filenames.length > 0
      ? fork(
        resolveBin.sync('jest'),
        [
          '\.test\.js$',
          '--testPathIgnorePatterns', '\.docker\.test\.js$',
          '--transform', `{"\.js":"${resolve(__dirname, 'jest-transformer.js')}"}`,
        ],
      )
      : undefined
    )
  )
  .then(() => glob('**/*.docker.test.js', { ignore: '**/node_modules/**' })
    .then(filenames => filenames.length > 0
      ? Promise.resolve()
        .then(() => console.log('Starting docker container …'))
        .then(() => spawn(
          'docker',
          [
            'run',
            '-e', 'NODE_ENV=production',
            '-u', 'node',
            '-v', `${process.cwd()}:/var/www`,
            '-w', '/var/www',
            '--rm',
            'node:alpine',
            relative(process.cwd(), resolveBin.sync('jest')),
            '\.docker\.test\.js$',
            '--transform', `{"\.js":"<rootDir>/${relative(process.cwd(), resolve(__dirname, 'jest-transformer.js'))}"}`,
          ],
          { stdio: 'inherit' },
        ))
      : undefined
    )
  )
  .catch(({ name, code }) => name === 'ChildProcessError' ? process.exit(code) : undefined)
