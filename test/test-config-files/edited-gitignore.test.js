import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { endent } from '@dword-design/functions'
import { outputFile } from 'fs-extra'
import { spawn } from 'child-process-promise'
import testConfigFiles from '../../src/test-config-files'

export default () => withLocalTmpDir(__dirname, async () => {
  await spawn('base', ['prepare'])
  await outputFile('.gitignore', endent`
    .DS_Store
    /.editorconfig
    /.nyc_output
    /.vscode
    /coverage
    /dist
    /node_modules

  `)
  let message
  try {
    await testConfigFiles()
  } catch (error) {
    message = error.message
  }
  expect(message).toEqual(endent`
    \u001b[33m--- .gitignore\tremoved\u001b[39m
    \u001b[33m+++ .gitignore\tadded\u001b[39m
    \u001b[35m@@ -1,6 +1,8 @@\u001b[39m
     .DS_Store
     /.editorconfig
    \u001b[32m+/.env\u001b[39m
    \u001b[32m+/.eslintrc.json\u001b[39m
     /.nyc_output
     /.vscode
     /coverage
     /dist
  `)
})
