import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import { outputFile, readFile, remove } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'

import { Base } from '@/src'

export default tester(
  {
    'create folder': async () => {
      await outputFile(
        'package.json',
        JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'mkdir dist && echo "foo bar" > dist/index.js',
            },
          },
          undefined,
          2
        )
      )
      await new Base({
        package: { name: P.basename(process.cwd()) },
      }).testDocker({ log: false })
      await remove('dist')
    },
    'create folder and error': async () => {
      await outputFile(
        'package.json',
        JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw':
                'mkdir dist && echo "foo bar" > dist/index.js && exit 1',
            },
          },
          undefined,
          2
        )
      )
      await expect(
        new Base({ package: { name: P.basename(process.cwd()) } }).testDocker({
          log: false,
        })
      ).rejects.toThrow()
      await remove('dist')
    },
    env: async () => {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          bar: { type: 'string' },
          foo: { type: 'string' },
        }),
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
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
      try {
        await new Base({
          package: { name: P.basename(process.cwd()) },
        }).testDocker({ log: false })
      } finally {
        process.env = previousEnv
      }
    },
    git: async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': "require('child_process').spawn('git', ['--help'])",
      })
      await new Base({
        package: { name: P.basename(process.cwd()) },
      }).testDocker({ log: false })
    },
    grep: async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
        const fs = require('fs')
        
        fs.writeFileSync('grep.txt', process.argv.slice(2).toString())
      `,
      })
      await new Base({
        package: { name: P.basename(process.cwd()) },
      }).testDocker({ grep: 'foo bar baz', log: false })
      expect(await readFile('grep.txt', 'utf8')).toEqual('-g,foo bar baz')
    },
    pattern: async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
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
        (await new Base({
          package: { name: P.basename(process.cwd()) },
        }).testDocker({ log: false, pattern: 'foo bar baz' }))
          |> await
          |> property('all')
      ).toMatch('foo bar baz')
    },
    puppeteer: async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'node test.js',
            },
          },
          undefined,
          2
        ),
        'test.js': endent`
          const puppeteer = require('@dword-design/puppeteer')
          const Xvfb = require('xvfb')
          const xvfb = new Xvfb()

          const run = async () => {
            try {
              xvfb.startSync()
              const browser = await puppeteer.launch({ headless: false })
              await browser.close()
              xvfb.stopSync()
            } catch (error) {
              console.error(error)
              process.exit(1)
            }
          }

          run()
        `,
      })
      await execa.command('yarn add @dword-design/puppeteer xvfb')
      await new Base({
        package: { name: P.basename(process.cwd()) },
      }).testDocker({ log: false })
    },
    'update snapshots': async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
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
      await new Base({
        package: { name: P.basename(process.cwd()) },
      }).testDocker({ log: false, updateSnapshots: true })
    },
    works: async () => {
      await outputFiles({
        'is-docker.js': await readFile(require.resolve('is-docker'), 'utf8'),
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
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

      const base = new Base({ package: { name: P.basename(process.cwd()) } })
      expect(
        base.testDocker({ log: false }) |> await |> property('all')
      ).not.toMatch('Already up-to-date.')
      expect(
        base.testDocker({ log: false }) |> await |> property('all')
      ).toMatch('Already up-to-date.')
    },
  },
  [
    {
      transform: test => async () => {
        try {
          await test()
        } finally {
          await execa.command(`docker volume rm ${P.basename(process.cwd())}`)
        }
      },
    },
    testerPluginTmpDir(),
  ]
)
