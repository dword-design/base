import {
  endent,
  identity,
  includes,
  keyBy,
  mapValues,
  stubTrue,
} from '@dword-design/functions'
import execa from 'execa'
import { readFile } from 'fs-extra'
import globby from 'globby'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

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
      await execa(require.resolve('../cli'), ['prepare'])
      expect(
        globby('*', { dot: true }) |> await |> includes('foo.txt')
      ).toBeTruthy()
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
      const output = await execa(require.resolve('../cli'), ['prepare'], {
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
        'yarn.lock': '',
      })
      await execa(require.resolve('../cli'), ['prepare'])
      expect(
        globby('*', { dot: true, onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toEqual({
        '.babelrc.json': true,
        '.commitlintrc.json': true,
        '.cz.json': true,
        '.editorconfig': true,
        '.env.json': true,
        '.env.schema.json': true,
        '.eslintrc.json': true,
        '.git': true,
        '.gitattributes': true,
        '.github': true,
        '.gitignore': true,
        '.gitpod.Dockerfile': true,
        '.gitpod.yml': true,
        '.huskyrc.json': true,
        '.releaserc.json': true,
        '.renovaterc.json': true,
        '.test.env.json': true,
        '.vscode': true,
        'CHANGELOG.md': true,
        'LICENSE.md': true,
        'README.md': true,
        'package.json': true,
        src: true,
        'yarn.lock': true,
      })
      expect(await readFile('README.md', 'utf8')).toEqual(endent`
      <!-- TITLE/ -->
      # foo
      <!-- /TITLE -->
  
      <!-- BADGES/ -->
      [![NPM version](https://img.shields.io/npm/v/foo.svg)](https://npmjs.org/package/foo)
      ![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)
      [![Build status](https://github.com/dword-design/bar/workflows/build/badge.svg)](https://github.com/dword-design/bar/actions)
      [![Coverage status](https://img.shields.io/coveralls/dword-design/bar)](https://coveralls.io/github/dword-design/bar)
      [![Dependency status](https://img.shields.io/david/dword-design/bar)](https://david-dm.org/dword-design/bar)
      ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)
      
      <a href="https://gitpod.io/#https://github.com/dword-design/bar">
        <img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod">
      </a><a href="https://www.buymeacoffee.com/dword">
        <img
          src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
          alt="Buy Me a Coffee"
          height="32"
        >
      </a><a href="https://paypal.me/SebastianLandwehr">
        <img
          src="https://dword-design.de/images/paypal.svg"
          alt="PayPal"
          height="32"
        >
      </a><a href="https://www.patreon.com/dworddesign">
        <img
          src="https://dword-design.de/images/patreon.svg"
          alt="Patreon"
          height="32"
        >
      </a>
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
