import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { outputFile } from 'fs-extra'

import { Base } from '@/src'

export default tester(
  {
    async badges() {
      await outputFile(
        'README.md',
        endent`
      <!-- BADGES -->
      
    `
      )
      expect(
        new Base({
          package: {
            name: '@dword-design/foo',
            repository: 'dword-design/base',
          },
        }).getReadmeString()
      ).toMatchSnapshot(this)
    },
    'badges private': async function () {
      await outputFile(
        'README.md',
        endent`
      <!-- BADGES -->
      
    `
      )
      expect(
        new Base({
          package: { name: '@dword-design/foo', private: true },
        }).getReadmeString()
      ).toMatchSnapshot(this)
    },
    description: async () => {
      await outputFile(
        'README.md',
        endent`
      <!-- DESCRIPTION -->
      
    `
      )
      expect(
        new Base({ package: { description: 'foo bar baz' } }).getReadmeString()
      ).toEqual(endent`
      <!-- DESCRIPTION/ -->
      foo bar baz
      <!-- /DESCRIPTION -->

    `)
    },
    'existing content': async function () {
      await outputFile(
        'README.md',
        endent`
      <!-- DESCRIPTION -->

      This is a more detailed description

      <!-- LICENSE -->

    `
      )
      expect(
        new Base({
          package: {
            author: 'dword-design',
            description: 'foo bar baz',
            license: 'MIT',
          },
        }).getReadmeString()
      ).toMatchSnapshot(this)
    },
    install: async () => {
      await outputFile(
        'README.md',
        endent`
      <!-- INSTALL -->
      
    `
      )
      expect(new Base({ package: { name: 'foo' } }).getReadmeString())
        .toEqual(endent`
    <!-- INSTALL/ -->
    ## Install
    
    \`\`\`bash
    # npm
    $ npm install foo

    # Yarn
    $ yarn add foo
    \`\`\`
    <!-- /INSTALL -->

  `)
    },
    async license() {
      await outputFile(
        'README.md',
        endent`
      <!-- LICENSE -->
      
    `
      )
      expect(
        new Base({ package: { license: 'MIT' } }).getReadmeString()
      ).toMatchSnapshot(this)
    },
    async seeAlso() {
      await outputFile(
        'README.md',
        endent`
      <!-- LICENSE -->
      
    `
      )
      expect(
        new Base({
          package: { license: 'MIT' },
          seeAlso: [
            { description: 'Foo bar', repository: 'output-files' },
            { description: 'Bar baz', repository: 'foo/with-local-tmp-dir' },
          ],
        }).getReadmeString()
      ).toMatchSnapshot(this)
    },
    title: async () => {
      await outputFile(
        'README.md',
        endent`
      <!-- TITLE -->
      
    `
      )
      expect(new Base({ package: { name: 'foo' } }).getReadmeString())
        .toEqual(endent`
    <!-- TITLE/ -->
    # foo
    <!-- /TITLE -->

  `)
    },
  },
  [testerPluginTmpDir()]
)
