import { isEmpty, mapValues } from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

import UnknownFilesError from './unknown-files-error'

const runTest = config => {
  config = {
    commonAllowedMatches: [],
    configAllowedMatches: [],
    configFiles: [],
    files: {},
    gitignore: [],
    result: {},
    ...config,
  }
  return () => {
    const self = proxyquire('.', {
      '../../config': {
        allowedMatches: config.configAllowedMatches,
      },
    })
    return withLocalTmpDir(async () => {
      await outputFiles(config.files)
      if (isEmpty(config.result)) {
        await self()
      } else {
        await expect(self).rejects.toThrow(new UnknownFilesError(config.result))
      }
    })
  }
}

export default {
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
  gitignore: {
    files: {
      '.env.json': '',
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
} |> mapValues(runTest)
