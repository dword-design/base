import { endent } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import { outputFile, readFile } from 'fs-extra'
import outputFiles from 'output-files'
import P from 'path'

import { Base } from '@/src'

export default tester(
  {
    'custom linter': async () => {
      const base = new Base({
        lint: () => {
          throw new Error('foobar')
        },
      })
      await base.prepare()
      await expect(base.lint()).rejects.toThrow('foobar')
    },
    fixable: async () => {
      await outputFile('src/index.js', "console.log('foo');")

      const base = new Base()
      await base.prepare()
      await base.lint()
      expect(await readFile(P.join('src', 'index.js'), 'utf8')).toEqual(
        endent`
        console.log('foo')

      `
      )
    },
    'linting errors': async () => {
      await outputFile('src/index.js', "const foo = 'bar'")

      const base = new Base()
      await base.prepare()
      await expect(base.lint()).rejects.toThrow(
        "'foo' is assigned a value but never used"
      )
    },
    'package name != repository name': async () => {
      await outputFile('package.json', JSON.stringify({ name: '@scope/bar' }))
      await execa.command('git init')
      await execa.command(
        'git remote add origin https://github.com/xyz/foo.git'
      )

      const base = new Base()
      await base.prepare()
      await expect(base.lint()).rejects.toThrow(
        "Package name 'bar' has to be equal to repository name 'foo'"
      )
    },
    'package name with dot': async () => {
      await outputFile('package.json', JSON.stringify({ name: 'foo.de' }))
      await execa.command('git init')
      await execa.command(
        'git remote add origin https://github.com/xyz/foo.de.git'
      )

      const base = new Base()
      await base.prepare()
      await base.lint()
    },
    'plugin next to config': async () => {
      await outputFiles({
        node_modules: {
          '@dword-design/eslint-config': {
            'index.js': endent`
            module.exports = {
              plugins: ['foo'],
            }
          `,
            'node_modules/eslint-plugin-foo/index.js': '',
          },
          'eslint-plugin-foo/index.js': 'foo bar',
        },
        'src/index.js': '',
      })

      const base = new Base()
      await base.prepare()
      await base.lint({
        resolvePluginsRelativeTo: P.join(
          'node_modules',
          '@dword-design',
          'eslint-config'
        ),
      })
    },
  },
  [testerPluginTmpDir()]
)
