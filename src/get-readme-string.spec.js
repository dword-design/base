import withLocalTmpDir from 'with-local-tmp-dir'
import getReadmeString from './get-readme-string'
import { outputFile } from 'fs-extra'
import { endent } from '@dword-design/functions'

export default {
  title: () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- TITLE -->
      
    `)
    expect(await getReadmeString({ name: 'foo' })).toEqual(endent`
      <!-- TITLE/ -->

      # foo

      <!-- /TITLE -->

    `)
  }),
  badges: () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- BADGES -->
      
    `)
    expect(await getReadmeString({ name: '@dword-design/foo', repository: 'dword-design/bar' }))
      .toEqual(endent`
        <!-- BADGES/ -->

        [![NPM version](https://img.shields.io/npm/v/@dword-design/foo.svg)](https://npmjs.org/package/@dword-design/foo)
        [![Build status](https://img.shields.io/github/workflow/status/dword-design/bar/build)](https://github.com/dword-design/bar/actions)
        [![Coverage status](https://img.shields.io/coveralls/dword-design/bar)](https://coveralls.io/github/dword-design/bar)
        [![Dependency status](https://img.shields.io/david/dword-design/bar)](https://david-dm.org/dword-design/bar)
        ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)
        ![Ubuntu compatible](https://img.shields.io/badge/os-ubuntu-blue)
        ![macOS compatible](https://img.shields.io/badge/os-macos-blue)
        ![Windows compatible](https://img.shields.io/badge/os-windows-blue)

        [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dword-design/bar)

        <!-- /BADGES -->

      `)
  }),
  description: () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- DESCRIPTION -->
      
    `)
    expect(await getReadmeString({ description: 'foo bar baz' })).toEqual(endent`
      <!-- DESCRIPTION/ -->

      foo bar baz

      <!-- /DESCRIPTION -->

    `)
  }),
  install: () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- INSTALL -->
      
    `)
    expect(await getReadmeString({ name: 'foo' })).toEqual(endent`
      <!-- INSTALL/ -->

      # Install
      
      \`\`\`bash
      # NPM
      $ npm install foo

      # Yarn
      $ yarn add foo
      \`\`\`

      <!-- /INSTALL -->

    `)
  }),
  license: () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- LICENSE -->
      
    `)
    expect(await getReadmeString({ author: 'foo bar', license: 'MIT' })).toEqual(endent`
      <!-- LICENSE/ -->

      # License

      Unless stated otherwise all works are:

      Copyright &copy; foo bar

      and licensed under:

      [MIT License](https://opensource.org/licenses/MIT)

      <!-- /LICENSE -->

    `)
  }),
  'existing content': () => withLocalTmpDir(async () => {
    await outputFile('README.md', endent`
      <!-- DESCRIPTION -->
      
      This is a more detailed description

      <!-- LICENSE -->

    `)
    expect(await getReadmeString({
      description: 'foo bar baz',
      author: 'dword-design',
      license: 'MIT',
    }))
      .toEqual(endent`
        <!-- DESCRIPTION/ -->

        foo bar baz

        <!-- /DESCRIPTION -->

        This is a more detailed description

        <!-- LICENSE/ -->

        # License

        Unless stated otherwise all works are:

        Copyright &copy; dword-design

        and licensed under:

        [MIT License](https://opensource.org/licenses/MIT)

        <!-- /LICENSE -->

      `)
  }),
}