import { isEmpty } from '@dword-design/functions'
import outputFiles from 'output-files'
import tester from '@dword-design/tester'
import testerPluginTmpDir from '@dword-design/tester-plugin-tmp-dir'
import self from '.'

import UnknownFilesError from './unknown-files-error'

export default tester({
  'config allowed matches': {
    configAllowedMatches: ['bar.txt'],
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    result: {
      'foo.txt': true,
    },
  },
  'full path': {
    files: {
      '.github/workflows/foo.yml': '',
    },
    result: {
      '.github/workflows/foo.yml': true,
    },
  },
  gitignore: {
    files: {
      '.env.json': '',
    },
  },
  husky: {
    files: {
      '.husky': {
        '.gitignore': '',
        _: {
          '.gitignore': '',
          'husky.sh': '',
        },
        'commit-msg': '',
        'post-checkout': '',
        'post-commit': '',
        'post-merge': '',
        'pre-push': '',
      },
    },
    result: {
      '.husky/.gitignore': true,
    },
  },
  subfolder: {
    configAllowedMatches: ['foo'],
    files: {
      'foo/bar.txt': '',
    },
  },
  works: {
    files: {
      'foo.txt': '',
    },
    result: {
      'foo.txt': true,
    },
  },
}, [
  testerPluginTmpDir(),
  {
    transform: test => {
      test = {
        commonAllowedMatches: [],
        configAllowedMatches: [],
        configFiles: [],
        files: {},
        gitignore: [],
        result: {},
        ...test,
      }
    
      return async () => {
        await outputFiles(test.files)
        const config = await getConfig()
        if (isEmpty(test.result)) {
          await self(config)
        } else {
          await expect(self(config)).rejects.toThrow(new UnknownFilesError(test.result))
        }
      }
    }
  }
])
