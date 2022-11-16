import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import self from '.'
import { outputFile } from 'fs-extra'

export default tester({
  async badges() {
    await outputFile('README.md', endent`
      <!-- BADGES -->
      
    `)
    expect(self({ package: { name: '@dword-design/foo', "repository": "dword-design/base" } })).toMatchSnapshot(this)
  },
  'badges private': async function () {
    await outputFile('README.md', endent`
      <!-- BADGES -->
      
    `)
    expect(self({ package: { name: '@dword-design/foo', private: true } })).toMatchSnapshot(this)
  },
  description: async () => {
    await outputFile('README.md', endent`
      <!-- DESCRIPTION -->
      
    `)
    expect(self({ package: { description: 'foo bar baz' } })).toEqual(endent`
      <!-- DESCRIPTION/ -->
      foo bar baz
      <!-- /DESCRIPTION -->

    `)
  },
  'existing content': async function () {
    await outputFile('README.md', endent`
      <!-- DESCRIPTION -->

      This is a more detailed description

      <!-- LICENSE -->

    `)
    expect(self({
      package: {
        author: 'dword-design',
        description: 'foo bar baz',
        license: 'MIT',
      },
    })).toMatchSnapshot(this)
  },
  install: async () => {
    await outputFile('README.md', endent`
      <!-- INSTALL -->
      
    `)
    expect(self({ package: { name: 'foo' } })).toEqual(endent`
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
    await outputFiles('README.md', endent`
      <!-- LICENSE -->
      
    `)
    expect(self({ package: { license: 'MIT' } })).toMatchSnapshot(this)
  },
  async seeAlso() {
    await outputFile('README.md', endent`
      <!-- LICENSE -->
      
    `)
    expect(self({ seeAlso: [
      { description: 'Foo bar', repository: 'output-files' },
      { description: 'Bar baz', repository: 'foo/with-local-tmp-dir' },
    ], package: { license: 'MIT' }})).toMatchSnapshot(this)
  },
  title: async () => {
    await outputFile('README.md', endent`
      <!-- TITLE -->
      
    `)
    expect(self({ package: { name: 'foo' } })).toEqual(endent`
    <!-- TITLE/ -->
    # foo
    <!-- /TITLE -->

  `)
  },
}, [testerPluginTmpDir()])
