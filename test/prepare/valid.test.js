import withLocalTmpDir from 'with-local-tmp-dir'
import resolveBin from 'resolve-bin'
import { spawn } from 'child_process'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import { resolve } from 'path'
import { endent } from '@functions'
import { readFile, exists } from 'fs'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'dist/foo.js': '',
    'src/index.js': 'export default \'hi\'',
    'package.json': JSON.stringify({
      name: 'foo',
      description: 'This is a test package.',
      repository: 'bar/foo',
      license: 'MIT',
    }),
    'README.md': endent`
      <!-- TITLE -->

      <!-- BADGES -->

      <!-- DESCRIPTION -->

      <!-- INSTALL -->

      <!-- LICENSE -->
    ` + '\n',
  })
  const { stdout } = await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'], { capture: ['stdout'] })
  expect(stdout).toEqual(endent`
    Copying config files …
    Updating README.md …
    Successfully compiled 1 file with Babel.
  ` + '\n')
  expect(await glob('*', { dot: true })).toEqual(['.editorconfig', '.gitignore', '.gitpod.yml', '.renovaterc.json', '.travis.yml', 'dist', 'LICENSE.md', 'package.json', 'README.md', 'src'])
  expect(require(resolve('dist'))).toEqual('hi')
  expect(await readFile('README.md', 'utf8')).toEqual(endent`
    <!-- TITLE/ -->

    <h1>foo</h1>

    <!-- /TITLE -->


    <!-- BADGES/ -->

    <span class="badge-npmversion"><a href="https://npmjs.org/package/foo" title="View this project on NPM"><img src="https://img.shields.io/npm/v/foo.svg" alt="NPM version" /></a></span>
    <span class="badge-travisci"><a href="http://travis-ci.org/bar/foo" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bar/foo/master.svg" alt="Travis CI Build Status" /></a></span>
    <span class="badge-coveralls"><a href="https://coveralls.io/r/bar/foo" title="View this project's coverage on Coveralls"><img src="https://img.shields.io/coveralls/bar/foo.svg" alt="Coveralls Coverage Status" /></a></span>
    <span class="badge-daviddm"><a href="https://david-dm.org/bar/foo" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bar/foo.svg" alt="Dependency Status" /></a></span>

    <!-- /BADGES -->


    <!-- DESCRIPTION/ -->

    This is a test package.

    <!-- /DESCRIPTION -->


    <!-- INSTALL/ -->

    <h2>Install</h2>

    <a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>
    <ul>
    <li>Install: <code>npm install --save foo</code></li>
    </ul>

    <!-- /INSTALL -->


    <!-- LICENSE/ -->

    <h2>License</h2>

    Unless stated otherwise all works are:



    and licensed under:

    <ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

    <!-- /LICENSE -->
  ` + '\n')
  expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
  expect(await exists('dist/foo.js')).toBeFalsy()
})

export const timeout = 12000
