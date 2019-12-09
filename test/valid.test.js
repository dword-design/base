import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import { resolve } from 'path'
import { endent } from '@functions'
import { readFile } from 'fs'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import sortPackageJson from 'sort-package-json'

export const it = async () => {

  const files = {
    ...minimalProjectConfig,
    'package.json': JSON.stringify(sortPackageJson({
      ...minimalPackageConfig,
      devDependencies: {
        expect: '^0.1.0',
      },
    }), undefined, 2),
    'test/foo.test.js': endent`
      import foo from 'foo'
      import expect from 'expect'

      export default () => expect(foo).toEqual(1)
    `,
  }

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
    const { stdout } = (await spawn('base', ['build'], { capture: ['stdout'] }))
    expect(stdout).toEqual(endent`
      Copying config files …
      Updating README.md …
      Successfully compiled 1 file with Babel.
    ` + '\n')
    expect(await glob('*', { dot: true })).toEqual([
      '.babelrc',
      '.editorconfig',
      '.eslintrc.json',
      '.gitignore',
      '.gitpod.yml',
      '.renovaterc.json',
      '.travis.yml',
      'dist',
      'LICENSE.md',
      'package.json',
      'README.md',
      'src',
      'test',
    ])
    expect(require(resolve('dist'))).toEqual(1)
    expect(await readFile('README.md', 'utf8')).toEqual(endent`
      <!-- TITLE/ -->

      <h1>foo</h1>

      <!-- /TITLE -->


      <!-- BADGES/ -->

      <span class="badge-npmversion"><a href="https://npmjs.org/package/foo" title="View this project on NPM"><img src="https://img.shields.io/npm/v/foo.svg" alt="NPM version" /></a></span>
      <span class="badge-travisci"><a href="http://travis-ci.org/bar/foo" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/bar/foo/master.svg" alt="Travis CI Build Status" /></a></span>
      <span class="badge-coveralls"><a href="https://coveralls.io/r/bar/foo" title="View this project's coverage on Coveralls"><img src="https://img.shields.io/coveralls/bar/foo.svg" alt="Coveralls Coverage Status" /></a></span>
      <span class="badge-daviddm"><a href="https://david-dm.org/bar/foo" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/bar/foo.svg" alt="Dependency Status" /></a></span>
      <span class="badge-shields"><a href="https://img.shields.io/badge/renovate-enabled-brightgreen.svg"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" /></a></span>

      <!-- /BADGES -->


      <!-- DESCRIPTION/ -->

      This is a test package.

      <!-- /DESCRIPTION -->


      <!-- INSTALL/ -->

      <h2>Install</h2>

      <a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>
      <ul>
      <li>Install: <code>npm install --save foo</code></li>
      <li>Require: <code>require('foo')</code></li>
      </ul>

      <!-- /INSTALL -->


      <!-- LICENSE/ -->

      <h2>License</h2>

      Unless stated otherwise all works are:

      <ul><li>Copyright &copy; bar</li></ul>

      and licensed under:

      <ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

      <!-- /LICENSE -->
    ` + '\n')
    expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
  })

  await withLocalTmpDir(__dirname, async () => {
    await outputFiles(files)
    const { stdout } = await spawn('base', ['test'], { capture: ['stdout'] })
    expect(stdout).toMatch(new RegExp(endent`
      ^Copying config files …
      Successfully compiled 1 file with Babel.
      No depcheck issue


      ✓ foo

      1 passing.*?

      ----------|----------|----------|----------|----------|-------------------|
      File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
      ----------|----------|----------|----------|----------|-------------------|
      All files |        0 |        0 |        0 |        0 |                   |
      ----------|----------|----------|----------|----------|-------------------|
    ` + '\n$'))
    expect(await glob('*', { dot: true })).toEqual([
      '.babelrc',
      '.gitignore',
      '.gitpod.yml',
      '.nyc_output',
      '.renovaterc.json',
      '.travis.yml',
      'coverage',
      'LICENSE.md',
      'node_modules',
      'package.json',
      'README.md',
      'src',
      'test',
    ])
  })
}

export const timeout = 20000
