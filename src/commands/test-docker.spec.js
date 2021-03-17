import { endent, property } from '@dword-design/functions'
import execa from 'execa'
import { readFile } from 'fs-extra'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

import self from './test-docker'

export default {
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
        'test.js': 'console.log(process.argv.slice(2))',
      })
      expect(
        self('', { grep: 'foobarbaz', log: false }) |> await |> property('all')
      ).toMatch('foobarbaz')
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
        'test.js': 'console.log(process.argv[2])',
      })
      expect(
        self('foobarbaz', { log: false }) |> await |> property('all')
      ).toMatch('foobarbaz')
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
          if (!process.env.SNAPSHOT_UPDATE) {
            process.exit(1)
          }

        `,
      })
      await self('', { log: false, updateSnapshots: true })
    }),
  works: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'is-docker.js': await readFile(require.resolve('is-docker'), 'utf8'),
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
