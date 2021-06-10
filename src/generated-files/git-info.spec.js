import { pick } from '@dword-design/functions'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'

import stealthyRequire from '@/src/stealthy-require'

export default tester(
  {
    'invalid github url': async () => {
      await execa.command('git init')
      await execa.command('git remote add origin https://github.com/foo.git')
      expect(() =>
        stealthyRequire(require.cache, () => require('./git-info'))
      ).toThrow('Only GitHub repositories are supported.')
    },
    'invalid url': async () => {
      await execa.command('git init')
      await execa.command('git remote add origin foo')
      expect(() =>
        stealthyRequire(require.cache, () => require('./git-info'))
      ).toThrow('Only GitHub repositories are supported.')
    },
    'not github': async () => {
      await execa.command('git init')
      await execa.command('git remote add origin https://foo.com/foo/bar.git')
      expect(() =>
        stealthyRequire(require.cache, () => require('./git-info'))
      ).toThrow('Only GitHub repositories are supported.')
    },
    works: async () => {
      await execa.command('git init')
      await execa.command(
        'git remote add origin https://github.com/foo/bar.git'
      )

      const gitInfo = stealthyRequire(require.cache, () =>
        require('./git-info')
      )
      expect(gitInfo |> pick(['user', 'project'])).toEqual({
        project: 'bar',
        user: 'foo',
      })
    },
  },
  [testerPluginTmpDir()]
)
