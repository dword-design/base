import withLocalTmpDir from 'with-local-tmp-dir'
import { spawn } from 'child_process'
import expect from 'expect'
import { minimalPackageConfig, minimalProjectConfig } from '@dword-design/base'
import outputFiles from 'output-files'
import { omit } from '@functions'

export const it = () => withLocalTmpDir(__dirname, async () => {
  await outputFiles({
    ...minimalProjectConfig,
    'package.json': JSON.stringify(minimalPackageConfig |> omit('name'), undefined, 2),
  })
  let stdout
  try {
    await spawn('base', ['test'], { capture: ['stderr'] })
  } catch (error) {
    stdout = error.stderr
  }
  expect(stdout).toMatch('data should have required property \'name\'')
})

export const timeout = 8000
