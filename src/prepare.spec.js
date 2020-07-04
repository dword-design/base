import { endent, identity, includes, sortBy } from '@dword-design/functions'
import execa from 'execa'
import { readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

import commonAllowedMatches from './common-allowed-matches.json'

export default {
  'additional allowed match': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'foo.txt': '',
        'node_modules/base-config-foo/index.js': endent`
          module.exports = {
            allowedMatches: [
              'foo.txt',
            ],
          }
        `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      await execa(require.resolve('./cli'), ['prepare'])
      expect(
        globby('*', { dot: true }) |> await |> includes('foo.txt')
      ).toBeTruthy()
    }),
  'additional file': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'foo.txt': '',
        'src/index.js': 'export default 1',
        'test/foo.test.js': '',
      })
      await execa(require.resolve('./cli'), ['prepare'])
      expect(
        globby('*', { dot: true }) |> await |> includes('foo.txt')
      ).toBeFalsy()
    }),
  'custom prepare': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'foo.txt': '',
        'node_modules/base-config-foo/index.js': endent`
          module.exports = {
            prepare: () => console.log('custom prepare'),
          }
        `,
        'package.json': JSON.stringify(
          {
            baseConfig: 'foo',
          },
          undefined,
          2
        ),
      })
      const output = await execa(require.resolve('./cli'), ['prepare'], {
        all: true,
      })
      expect(output.all).toMatch('custom prepare')
    }),
  valid: () =>
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command(
        'git remote add origin git@github.com:dword-design/bar.git'
      )
      await outputFiles({
        '.env.json': '',
        '.env.schema.json': endent`
        {
          "foo": "bar"
        }
      `,
        '.test.env.json': '',
        'CHANGELOG.md': '',
        doc: {},
        'package.json': JSON.stringify(
          {
            author: 'dword-design',
            license: 'MIT',
            name: 'foo',
          },
          undefined,
          2
        ),
        'src/index.js': 'export default 1',
        'supporting-files': {},
        'test/foo.test.js': '',
        'yarn.lock': '',
      })
      await execa(require.resolve('./cli'), ['prepare'])
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> sortBy(identity)
      ).toEqual(
        [
          '.babelrc.json',
          '.cz.json',
          '.editorconfig',
          '.env.json',
          '.eslintrc.json',
          '.test.env.json',
          '.gitattributes',
          '.github',
          '.gitignore',
          '.gitpod.Dockerfile',
          '.gitpod.yml',
          '.releaserc.json',
          '.renovaterc.json',
          '.vscode',
          'LICENSE.md',
          'package.json',
          'README.md',
          ...commonAllowedMatches,
        ] |> sortBy(identity)
      )
      expect(await readFile('README.md', 'utf8')).toEqual(endent`
      <!-- TITLE/ -->
      # foo
      <!-- /TITLE -->
  
      <!-- BADGES/ -->
      [![NPM version](https://img.shields.io/npm/v/foo.svg)](https://npmjs.org/package/foo)
      ![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)
      [![Build status](https://img.shields.io/github/workflow/status/dword-design/bar/build)](https://github.com/dword-design/bar/actions)
      [![Coverage status](https://img.shields.io/coveralls/dword-design/bar)](https://coveralls.io/github/dword-design/bar)
      [![Dependency status](https://img.shields.io/david/dword-design/bar)](https://david-dm.org/dword-design/bar)
      ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)
      
      [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dword-design/bar)
      <!-- /BADGES -->
  
      <!-- DESCRIPTION/ -->

      <!-- /DESCRIPTION -->
  
      <!-- INSTALL/ -->
      ## Install
      
      \`\`\`bash
      # NPM
      $ npm install foo
      
      # Yarn
      $ yarn add foo
      \`\`\`
      <!-- /INSTALL -->
  
      <!-- LICENSE/ -->
      ## License
  
      Unless stated otherwise all works are:
  
      Copyright &copy; Sebastian Landwehr <info@dword-design.de>
  
      and licensed under:
  
      [MIT License](https://opensource.org/licenses/MIT)
      <!-- /LICENSE -->

    `)
      expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
    }),
}
