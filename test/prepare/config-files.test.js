import withLocalTmpDir from 'with-local-tmp-dir'
// import resolveBin from 'resolve-bin'
// import { spawn } from 'child_process'
// import { exists } from 'fs'
// import expect from 'expect'

export default {
  it: () => withLocalTmpDir(async () => {
    //await spawn(resolveBin.sync('@dword-design/base', { executable: 'base' }), ['prepare'], { stdio: 'inherit' })
    //expect(await exists('.gitignore')).toBeTruthy()
  }),
  timeout: 3000,
}
