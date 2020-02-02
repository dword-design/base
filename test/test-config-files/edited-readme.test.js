import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import { spawn } from 'child-process-promise'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await spawn('base', ['prepare'])
  await outputFile('README.md', endent`
    <!-- TITLE/ -->

    <h1>base-project</h1>

    <!-- /TITLE -->


    <!-- BADGES/ -->

    <span class="badge-npmversion"><a href="https://npmjs.org/package/base-project" title="View this project on NPM"><img src="https://img.shields.io/npm/v/base-project.svg" alt="NPM version" /></a></span>
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
    <li>Install: <code>npm install --save base-project</code></li>
    <li>Import: <code>import * as pkg from ('base-project')</code></li>
    <li>Require: <code>const pkg = require('base-project')</code></li>
    </ul>

    <!-- /INSTALL -->

    <h2>Usage</h2>
    Foo bar

    <!-- LICENSE/ -->

    <h2>License</h2>

    Unless stated otherwise all works are:

    <ul><li>Copyright &copy; Sebastian Landwehr</li></ul>

    and licensed under:

    <ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

    <!-- /LICENSE -->

  `)
  let message
  try {
    await testConfigFiles()
  } catch (error) {
    message = error.message
  }
  expect(message).toEqual(endent`
    \u001b[33m--- README.md\tremoved\u001b[39m
    \u001b[33m+++ README.md\tadded\u001b[39m
    \u001b[35m@@ -35,8 +35,9 @@\u001b[39m
     </ul>
${'     '}
     <!-- /INSTALL -->
${'     '}
    \u001b[32m+\u001b[39m
     <h2>Usage</h2>
     Foo bar
${'     '}
     <!-- LICENSE/ -->
  `)
})
