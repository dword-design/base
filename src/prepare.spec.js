import withLocalTmpDir from 'with-local-tmp-dir'
import outputFiles from 'output-files'
import glob from 'glob-promise'
import execa from 'execa'
import { includes, endent } from '@dword-design/functions'
import { readFile } from 'fs-extra'

export default {
  'additional file': () => withLocalTmpDir(async () => {
    await outputFiles({
      'src/index.js': 'export default 1',
      'test/foo.test.js': '',
      'foo.txt': '',
    })
    await execa.command('base prepare')
    expect(glob('*', { dot: true }) |> await |> includes('foo.txt')).toBeFalsy()
  }),
  valid: () => withLocalTmpDir(async () => {
    await execa.command('git init')
    await execa.command('git remote add origin git@github.com:dword-design/bar.git')
    await outputFiles({
      'package.json': endent`
        {
          "name": "foo",
          "license": "MIT",
          "author": "dword-design"
        }
  
      `,
      'src/index.js': 'export default 1',
      'test/foo.test.js': '',
      '.env': '',
      '.env.defaults': '',
      '.env.schema': '',
    })
    await execa.command('base prepare')
    expect(await glob('*', { dot: true })).toEqual([
      '.cz.json',
      '.editorconfig',
      '.env',
      '.env.defaults',
      '.env.schema',
      '.git',
      '.gitattributes',
      '.github',
      '.gitignore',
      '.gitpod.Dockerfile',
      '.gitpod.yml',
      '.releaserc.json',
      '.renovaterc.json',
      'LICENSE.md',
      'package.json',
      'README.md',
      'src',
      'test',
    ])
    expect(await readFile('README.md', 'utf8')).toEqual(endent`
      <!-- TITLE/ -->
      # foo
      <!-- /TITLE -->
  
      <!-- BADGES/ -->
      [![NPM version](https://img.shields.io/npm/v/foo.svg)](https://npmjs.org/package/foo)
      [![Build status](https://img.shields.io/github/workflow/status/dword-design/bar/build)](https://github.com/dword-design/bar/actions)
      [![Coverage status](https://img.shields.io/coveralls/dword-design/bar)](https://coveralls.io/github/dword-design/bar?branch=master)
      [![Dependency status](https://img.shields.io/david/dword-design/bar)](https://david-dm.org/dword-design/bar)
      ![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)
      
      [![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dword-design/bar)
      <!-- /BADGES -->
  
      <!-- DESCRIPTION/ -->
  
      <!-- /DESCRIPTION -->
  
      <!-- INSTALL/ -->
      # Install
      
      \`\`\`bash
      # NPM
      $ npm install foo
      
      # Yarn
      $ yarn add foo
      \`\`\`
      <!-- /INSTALL -->
  
      <!-- LICENSE/ -->
      # License
  
      Unless stated otherwise all works are:
  
      Copyright &copy; Sebastian Landwehr <info@dword-design.de>
  
      and licensed under:
  
      [MIT License](https://opensource.org/licenses/MIT)
      <!-- /LICENSE -->

    `)
    expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
  }),
}