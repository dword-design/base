import chdir from '@dword-design/chdir'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import execa from 'execa'
import { outputFile } from 'fs-extra'
import isCI from 'is-ci'
import outputFiles from 'output-files'
import P from 'path'

import { Base } from '@/src'

export default tester(
  {
    'GitHub CLI exists': async () => {
      if (isCI) {
        await execa.command('gh repo list')
      }
    },
    'job matrix'() {
      expect(
        new Base({
          nodeVersion: 14,
          supportedNodeVersions: [14, 16],
        }).getGithubWorkflowConfig()
      ).toMatchSnapshot(this)
    },
    'no job matrix'() {
      expect(
        new Base({
          nodeVersion: 14,
          useJobMatrix: false,
        }).getGithubWorkflowConfig()
      ).toMatchSnapshot(this)
    },
    async 'package.json'() {
      await outputFiles({
        '.env.schema.json': JSON.stringify({
          foo: { type: 'string' },
        }),
        'repos/foo/package.json': JSON.stringify({}),
      })
      await chdir(P.join('repos', 'foo'), () =>
        expect(new Base().getGithubWorkflowConfig()).toMatchSnapshot(this)
      )
    },
    async 'package.json same path as .env.schema.json'() {
      await outputFiles({
        'repos/foo': {
          '.env.schema.json': JSON.stringify({
            foo: { type: 'string' },
          }),
          'package.json': JSON.stringify({}),
        },
      })
      await chdir(P.join('repos', 'foo'), () =>
        expect(new Base().getGithubWorkflowConfig()).toMatchSnapshot(this)
      )
    },
    async 'test environment variables'() {
      await outputFile(
        '.env.schema.json',
        { bar: {}, foo: {} } |> JSON.stringify
      )
      expect(
        new Base({
          nodeVersion: 14,
          useJobMatrix: false,
        }).getGithubWorkflowConfig()
      ).toMatchSnapshot(this)
    },
    testInContainer() {
      expect(
        new Base({
          nodeVersion: 14,
          testInContainer: true,
          useJobMatrix: true,
        }).getGithubWorkflowConfig()
      ).toMatchSnapshot(this)
    },
  },
  [testerPluginTmpDir()]
)
