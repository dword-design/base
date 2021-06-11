import { endent } from '@dword-design/functions'
import execa from 'execa'
import outputFiles from 'output-files'
import stealthyRequire from 'stealthy-require-no-leak'
import withLocalTmpDir from 'with-local-tmp-dir'

export default {
  badges() {
    return withLocalTmpDir(async () => {
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

      const readmeString = stealthyRequire(require.cache, () => require('.'))
      expect(readmeString).toMatchSnapshot(this)
    })
  },
  description: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- DESCRIPTION -->
        
      `,
        'package.json': JSON.stringify({ description: 'foo bar baz' }),
      })

      const readmeString = stealthyRequire(require.cache, () => require('.'))
      expect(readmeString).toEqual(endent`
      <!-- DESCRIPTION/ -->
      foo bar baz
      <!-- /DESCRIPTION -->

    `)
    }),
  'existing content': function () {
    return withLocalTmpDir(async () => {
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

      const readmeString = stealthyRequire(require.cache, () => require('.'))
      expect(readmeString).toMatchSnapshot(this)
    })
  },
  install: () =>
    withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- INSTALL -->
        
      `,
        'package.json': JSON.stringify({ name: 'foo' }),
      })

      const readmeString = stealthyRequire(require.cache, () => require('.'))
      expect(readmeString).toEqual(endent`
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
    }),
  license() {
    return withLocalTmpDir(async () => {
      await outputFiles({
        'README.md': endent`
        <!-- LICENSE -->
        
      `,
        'package.json': JSON.stringify({ license: 'MIT' }),
      })

      const readmeString = stealthyRequire(require.cache, () => require('.'))
      expect(readmeString).toMatchSnapshot(this)
    })
  },
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

      const readmeString = stealthyRequire(require.cache, () => require('.'))
      expect(readmeString).toEqual(endent`
      <!-- TITLE/ -->
      # foo
      <!-- /TITLE -->

    `)
    }),
}
