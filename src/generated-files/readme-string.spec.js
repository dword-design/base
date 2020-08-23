import { endent } from '@dword-design/functions'
import execa from 'execa'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  badges: () =>
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command(
        'git remote add origin git@github.com:dword-design/bar.git'
      )
      await outputFiles({
        'README.md': endent`
        <!-- BADGES -->
        
      `,
        'package.json': JSON.stringify({ name: '@dword-design/foo' }),
      })
      const readmeString = stealthyRequire(require.cache, () =>
        require('./readme-string')
      )
      expect(readmeString).toEqual(endent`
        <!-- BADGES/ -->
        [![NPM version](https://img.shields.io/npm/v/@dword-design/foo.svg)](https://npmjs.org/package/@dword-design/foo)
        ![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)
        [![Build status](https://img.shields.io/github/workflow/status/dword-design/bar/build)](https://github.com/dword-design/bar/actions)
        [![Coverage status](https://img.shields.io/coveralls/dword-design/bar)](https://coveralls.io/github/dword-design/bar)
        [![Dependency status](https://img.shields.io/david/dword-design/bar)](https://david-dm.org/dword-design/bar)
        ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)

        <a href="https://www.buymeacoffee.com/dword">
          <img
            src="https://www.buymeacoffee.com/assets/img/guidelines/download-assets-sm-2.svg"
            alt="Buy Me a Coffee"
            height="32"
          >
        </a><a href="https://gitpod.io/#https://github.com/dword-design/bar">
          <img src="https://gitpod.io/button/open-in-gitpod.svg" alt="Open in Gitpod">
        </a>
        <a href="https://paypal.me/SebastianLandwehr">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
            alt="PayPal"
            height="30"
          >
        </a>
        <!-- /BADGES -->

      `)
    }),
  description: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- DESCRIPTION -->
        
      `,
        'package.json': JSON.stringify({ description: 'foo bar baz' }),
      })
      const readmeString = stealthyRequire(require.cache, () =>
        require('./readme-string')
      )
      expect(readmeString).toEqual(endent`
      <!-- DESCRIPTION/ -->
      foo bar baz
      <!-- /DESCRIPTION -->

    `)
    }),
  'existing content': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- DESCRIPTION -->

        This is a more detailed description

        <!-- LICENSE -->

      `,
        'package.json': JSON.stringify({
          author: 'dword-design',
          description: 'foo bar baz',
          license: 'MIT',
        }),
      })
      const readmeString = stealthyRequire(require.cache, () =>
        require('./readme-string')
      )
      expect(readmeString).toEqual(endent`
        <!-- DESCRIPTION/ -->
        foo bar baz
        <!-- /DESCRIPTION -->

        This is a more detailed description

        <!-- LICENSE/ -->
        ## License

        Unless stated otherwise all works are:

        Copyright &copy; Sebastian Landwehr <info@dword-design.de>

        and licensed under:

        [MIT License](https://opensource.org/licenses/MIT)
        <!-- /LICENSE -->

      `)
    }),
  install: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- INSTALL -->
        
      `,
        'package.json': JSON.stringify({ name: 'foo' }),
      })
      const readmeString = stealthyRequire(require.cache, () =>
        require('./readme-string')
      )
      expect(readmeString).toEqual(endent`
      <!-- INSTALL/ -->
      ## Install
      
      \`\`\`bash
      # NPM
      $ npm install foo

      # Yarn
      $ yarn add foo
      \`\`\`
      <!-- /INSTALL -->

    `)
    }),
  license: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- LICENSE -->
        
      `,
        'package.json': JSON.stringify({ license: 'MIT' }),
      })
      const readmeString = stealthyRequire(require.cache, () =>
        require('./readme-string')
      )
      expect(readmeString).toEqual(endent`
      <!-- LICENSE/ -->
      ## License

      Unless stated otherwise all works are:

      Copyright &copy; Sebastian Landwehr <info@dword-design.de>

      and licensed under:

      [MIT License](https://opensource.org/licenses/MIT)
      <!-- /LICENSE -->

    `)
    }),
  title: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- TITLE -->
        
      `,
        'package.json': JSON.stringify({
          name: 'foo',
        }),
      })
      const readmeString = stealthyRequire(require.cache, () =>
        require('./readme-string')
      )
      expect(readmeString).toEqual(endent`
      <!-- TITLE/ -->
      # foo
      <!-- /TITLE -->

    `)
    }),
}
