import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import outputFiles from 'output-files'

import { Base } from '@/src'

export default tester(
  {
    async badges() {
      await execa.command('git init')
      await execa.command(
        'git remote add origin git@github.com:dword-design/bar.git'
      )
      await outputFiles({
        'README.md': endent`
          <!-- BADGES -->
          
        `,
        'package.json': JSON.stringify({
          name: '@dword-design/foo',
          repository: 'dword-design/base',
        }),
      })
      expect(new Base().getReadmeString()).toMatchSnapshot(this)
    },
    async 'badges private'() {
      await execa.command('git init')
      await execa.command(
        'git remote add origin git@github.com:dword-design/bar.git'
      )
      await outputFiles({
        'README.md': endent`
          <!-- BADGES -->
          
        `,
        'package.json': JSON.stringify({
          name: '@dword-design/foo',
          private: true,
        }),
      })
      expect(new Base().getReadmeString()).toMatchSnapshot(this)
    },
    description: async () => {
      await outputFiles({
        'README.md': endent`
          <!-- DESCRIPTION -->
          
        `,
        'package.json': JSON.stringify({ description: 'foo bar baz' }),
      })
      expect(new Base().getReadmeString()).toEqual(endent`
        <!-- DESCRIPTION/ -->
        foo bar baz
        <!-- /DESCRIPTION -->

      `)
    },
    async 'existing content'() {
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
      expect(new Base().getReadmeString()).toMatchSnapshot(this)
    },
    install: async () => {
      await outputFiles({
        'README.md': endent`
          <!-- INSTALL -->
          
        `,
        'package.json': JSON.stringify({ name: 'foo' }),
      })
      expect(new Base().getReadmeString()).toEqual(endent`
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
      await outputFiles({
        'README.md': endent`
          <!-- LICENSE -->
          
        `,
        'package.json': JSON.stringify({ license: 'MIT' }),
      })
      expect(new Base().getReadmeString()).toMatchSnapshot(this)
    },
    async seeAlso() {
      await outputFiles({
        'README.md': endent`
          <!-- LICENSE -->
          
        `,
        'package.json': JSON.stringify({ license: 'MIT' }),
      })
      expect(
        new Base({
          seeAlso: [
            { description: 'Foo bar', repository: 'output-files' },
            { description: 'Bar baz', repository: 'foo/with-local-tmp-dir' },
          ],
        }).getReadmeString()
      ).toMatchSnapshot(this)
    },
    title: async () => {
      await outputFiles({
        'README.md': endent`
          <!-- TITLE -->
          
        `,
        'package.json': JSON.stringify({ name: 'foo' }),
      })
      expect(new Base().getReadmeString()).toEqual(endent`
          <!-- TITLE/ -->
          # foo
          <!-- /TITLE -->

        `)
    },
  },
  [testerPluginTmpDir()]
)
