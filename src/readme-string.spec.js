import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import { endent } from '@dword-design/functions'
import stealthyRequire from 'stealthy-require'
import execa from 'execa'

export default {
  title: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          name: 'foo',
        }),
        'README.md': endent`
        <!-- TITLE -->
        
      `,
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
  badges: () =>
    withLocalTmpDir(async () => {
      await execa.command('git init')
      await execa.command(
        'git remote add origin git@github.com:dword-design/bar.git'
      )
      await outputFiles({
        'package.json': JSON.stringify({ name: '@dword-design/foo' }),
        'README.md': endent`
        <!-- BADGES -->
        
      `,
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

        [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dword-design/bar)
        <!-- /BADGES -->

      `)
    }),
  description: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify({ description: 'foo bar baz' }),
        'README.md': endent`
        <!-- DESCRIPTION -->
        
      `,
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
  install: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify({ name: 'foo' }),
        'README.md': endent`
        <!-- INSTALL -->
        
      `,
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
        'package.json': JSON.stringify({ license: 'MIT' }),
        'README.md': endent`
        <!-- LICENSE -->
        
      `,
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
  'existing content': () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'package.json': JSON.stringify({
          description: 'foo bar baz',
          author: 'dword-design',
          license: 'MIT',
        }),
        'README.md': endent`
        <!-- DESCRIPTION -->

        This is a more detailed description

        <!-- LICENSE -->

      `,
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
}
