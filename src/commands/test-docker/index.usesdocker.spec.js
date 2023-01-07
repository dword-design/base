import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'
import fs from 'fs-extra'
import { createRequire } from 'module'
import outputFiles from 'output-files'
import P from 'path'

import { Base } from '@/src/index.js'

const require = createRequire(import.meta.url)

export default tester(
  {
    'create folder': async () => {
      await fs.outputFile(
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
      await new Base().testDocker({ log: false })
      await fs.remove('dist')
    },
    'create folder and error': async () => {
      await fs.outputFile(
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
        new Base().testDocker({
          log: false,
        })
      ).rejects.toThrow()
      await fs.remove('dist')
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
        await new Base().testDocker({ log: false })
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
            type: 'module',
          },
          undefined,
          2
        ),
        'test.js': endent`
          import { spawn } from 'child_process'
          
          spawn('git', ['--help'])
        `,
      })
      await new Base().testDocker({ log: false })
    },
    grep: async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'node test.js',
            },
            type: 'module',
          },
          undefined,
          2
        ),
        'test.js': endent`
        import fs from 'fs'
        
        fs.writeFileSync('grep.txt', process.argv.slice(2).toString())
      `,
      })
      await new Base().testDocker({ grep: 'foo bar baz', log: false })
      expect(await fs.readFile('grep.txt', 'utf8')).toEqual('-g,foo bar baz')
    },
    pattern: async () => {
      await outputFiles({
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'node test.js',
            },
            type: 'module',
          },
          undefined,
          2
        ),
        'test.js': endent`
        import fs from 'fs'
        
        fs.writeFileSync('grep.txt', process.argv[2])
      `,
      })
      expect(
        (await new Base().testDocker({ log: false, patterns: ['foo bar baz'] }))
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
            type: 'module',
          },
          undefined,
          2
        ),
        'test.js': endent`
          import puppeteer from '@dword-design/puppeteer'
          import Xvfb from 'xvfb'

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
      await execaCommand('yarn add @dword-design/puppeteer xvfb')
      await new Base().testDocker({ log: false })
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
      await new Base().testDocker({ log: false, updateSnapshots: true })
    },
    works: async () => {
      await outputFiles({
        'is-docker.cjs': await fs.readFile(
          require.resolve('is-docker'),
          'utf8'
        ),
        'package.json': JSON.stringify(
          {
            name: P.basename(process.cwd()),
            scripts: {
              'test:raw': 'node test.js',
            },
            type: 'module',
          },
          undefined,
          2
        ),
        'test.js': endent`
        import isDocker from './is-docker.cjs'
        
        if (!isDocker) {
          process.exit(1)
        }

      `,
      })
      await execaCommand('yarn')

      const base = new Base()
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
          await execaCommand(`docker volume rm ${P.basename(process.cwd())}`)
        }
      },
    },
    testerPluginTmpDir(),
  ]
)
