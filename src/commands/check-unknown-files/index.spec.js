import {
  isEmpty,
  map,
  mapValues,
  stubString,
  zipObject,
} from '@dword-design/functions'
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
      '../../generated-files': zipObject(
        config.configFiles,
        config.configFiles |> map(stubString)
      ),
      '../../generated-files/gitignore': config.gitignore,
      './common-allowed-matches.json': config.commonAllowedMatches,
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
  'common allowed matches': {
    commonAllowedMatches: ['bar.txt'],
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    result: {
      'foo.txt': true,
    },
  },
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
  'config files': {
    configFiles: ['bar.txt'],
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    result: {
      'foo.txt': true,
    },
  },
  'config files: subpath': {
    configFiles: ['sub/foo.txt'],
    files: {
      'sub/foo.txt': '',
    },
  },
  gitignore: {
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    gitignore: ['/bar.txt'],
    result: {
      'foo.txt': true,
    },
  },
} |> mapValues(runTest)
