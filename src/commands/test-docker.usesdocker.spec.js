import { endent, property } from '@dword-design/functions'
import execa from 'execa'
import fs from 'fs-extra'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from './test-docker.mjs'

export default {
  env: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          bar: { type: 'string' },
          foo: { type: 'string' },
        }),
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
          if (process.env.TEST_FOO !== 'foo') {
            throw new Error('Environment variable TEST_FOO is not set')
          }
          if (process.env.TEST_BAR !== undefined) {
            throw new Error('Environment variable TEST_BAR is set')
          }

        `,
      })

      const previousEnv = process.env
      process.env.TEST_FOO = 'foo'
      await self('', { log: false })
      process.env = previousEnv
    }),
  git: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': "require('child_process').spawn('git', ['--help'])",
      })
      await self('', { log: false })
    }),
  grep: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
          const fs = require('fs')
          
          fs.writeFileSync('grep.txt', process.argv.slice(2))
        `,
      })
      await self('', { grep: 'foo bar baz', log: false })
      expect(await fs.readFile('grep.txt', 'utf8')).toEqual('-g,foo bar baz')
    }),
  pattern: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
          const fs = require('fs')
          
          fs.writeFileSync('grep.txt', process.argv[2])
        `,
      })
      expect(
        self('foo bar baz', { log: false }) |> await |> property('all')
      ).toMatch('foo bar baz')
    }),
  puppeteer: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': "require('puppeteer').launch()",
      })
      await self('', { log: false })
    }),
  'update snapshots': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
          if (process.argv[2] !== '--update-snapshots') {
            throw new Error('--update-snapshots is not set')
          }

        `,
      })
      await self('', { log: false, updateSnapshots: true })
    }),
  works: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'is-docker.js': await fs.readFile(require.resolve('is-docker'), 'utf8'),
        'package.json': JSON.stringify(
          {
            name: 'foo',
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
          const isDocker = require('./is-docker')
          if (!isDocker) {
            process.exit(1)
          }

        `,
      })
      await execa.command('yarn')
      expect(self('', { log: false }) |> await |> property('all')).not.toMatch(
        'Already up-to-date.'
      )
      expect(self('', { log: false }) |> await |> property('all')).toMatch(
        'Already up-to-date.'
      )
    }),
}
