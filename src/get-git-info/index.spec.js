import { pick } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import { execaCommand } from 'execa'

import self from './index.js'

export default tester(
  {
    'invalid github url': async () => {
      await execaCommand('git init')
      await execaCommand('git remote add origin https://github.com/foo.git')
      expect(self).toThrow('Only GitHub repositories are supported.')
    },
    'invalid url': async () => {
      await execaCommand('git init')
      await execaCommand('git remote add origin foo')
      expect(self).toThrow('Only GitHub repositories are supported.')
    },
    'not github': async () => {
      await execaCommand('git init')
      await execaCommand('git remote add origin https://foo.com/foo/bar.git')
      expect(self).toThrow('Only GitHub repositories are supported.')
    },
    works: async () => {
      await execaCommand('git init')
      await execaCommand('git remote add origin https://github.com/foo/bar.git')
      expect(self() |> pick(['user', 'project'])).toEqual({
        project: 'bar',
        user: 'foo',
      })
    },
  },
  [testerPluginTmpDir()],
)
