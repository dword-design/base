import { spawn } from 'child-process-promise'
import withLocalTmpDir from 'with-local-tmp-dir'
import expect from 'expect'
import { outputFile } from 'fs-extra'
import { endent } from '@dword-design/functions'

export default () => withLocalTmpDir(__dirname, async () => {
  await outputFile('src/index.js', 'export default 1')
  await spawn('base', ['build'])
  await outputFile('.gitignore', endent`
    .DS_Store
    /.eslintrc.json
    /.nyc_output
    /.vscode
    /coverage
    /dist
    /node_modules

  `)
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stdout'] })
  } catch (error) {
    stdout = error.stdout
  }
  expect(stdout).toEqual(endent`
    \u001b[33m--- .gitignore\tremoved\u001b[39m
    \u001b[33m+++ .gitignore\tadded\u001b[39m
    \u001b[35m@@ -1,5 +1,7 @@\u001b[39m
     .DS_Store
    \u001b[32m+/.editorconfig\u001b[39m
    \u001b[32m+/.env\u001b[39m
     /.eslintrc.json
     /.nyc_output
     /.vscode
     /coverage

  `)
})
