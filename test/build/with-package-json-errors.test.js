import withLocalTmpDir from 'with-local-tmp-dir'
import resolveBin from 'resolve-bin'
import { spawn } from 'child_process'
import { exists } from 'fs'
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
    await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['build'], { capture: ['stderr'] })
  } catch (error) {
    stdout = error.stderr
  }
  expect(stdout).toMatch('data should have required property \'name\'')
  expect(await exists('dist')).toBeFalsy()
})

export const timeout = 8000
