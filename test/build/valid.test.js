import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child-process-promise'
import outputFiles from 'output-files'
import expect from 'expect'
import glob from 'glob-promise'
import P from 'path'
import { endent } from '@dword-design/functions'
import { readFile } from 'fs-extra'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    'package.json': endent`
      {
        "name": "foo",
        "devDependencies": {
          "expect": "^0.1.0"
        }
      }

    `,
    'src/index.js': 'export default 1',
    'test/foo.test.js': endent`
      import foo from 'foo'
      import expect from 'expect'

      export default () => {
        expect(process.env.NODE_ENV).toEqual('test')
        expect(foo).toEqual(1)
      }
    `,
  })
  const { stdout } = await spawn('base', ['build'], { capture: ['stdout'] })
  expect(stdout).toEqual('Successfully compiled 1 file with Babel.\n')
  expect(await glob('*', { dot: true })).toEqual([
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
  expect(require(P.resolve('dist'))).toEqual(1)
  expect(await readFile('README.md', 'utf8')).toEqual(endent`
    <!-- TITLE/ -->

    <h1>foo</h1>

    <!-- /TITLE -->


    <!-- BADGES/ -->

    <span class="badge-npmversion"><a href="https://npmjs.org/package/foo" title="View this project on NPM"><img src="https://img.shields.io/npm/v/foo.svg" alt="NPM version" /></a></span>
    <span class="badge-travisci"><a href="http://travis-ci.org/base/project" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/base/project/master.svg" alt="Travis CI Build Status" /></a></span>
    <span class="badge-coveralls"><a href="https://coveralls.io/r/base/project" title="View this project's coverage on Coveralls"><img src="https://img.shields.io/coveralls/base/project.svg" alt="Coveralls Coverage Status" /></a></span>
    <span class="badge-daviddm"><a href="https://david-dm.org/base/project" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/base/project.svg" alt="Dependency Status" /></a></span>
    <span class="badge-shields"><a href="https://img.shields.io/badge/renovate-enabled-brightgreen.svg"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" /></a></span>

    <!-- /BADGES -->


    <!-- DESCRIPTION/ -->



    <!-- /DESCRIPTION -->


    <!-- INSTALL/ -->

    <h2>Install</h2>

    <a href="https://npmjs.com" title="npm is a package manager for javascript"><h3>npm</h3></a>
    <ul>
    <li>Install: <code>npm install --save foo</code></li>
    <li>Import: <code>import * as pkg from ('foo')</code></li>
    <li>Require: <code>const pkg = require('foo')</code></li>
    </ul>

    <!-- /INSTALL -->


    <!-- LICENSE/ -->

    <h2>License</h2>

    Unless stated otherwise all works are:

    <ul><li>Copyright &copy; Sebastian Landwehr</li></ul>

    and licensed under:

    <ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

    <!-- /LICENSE -->
  ` + '\n')
  expect(await readFile('LICENSE.md', 'utf8')).toMatch('MIT License')
})
