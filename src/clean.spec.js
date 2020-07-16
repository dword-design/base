import {
  identity,
  keyBy,
  map,
  mapValues,
  stubString,
  stubTrue,
  zipObject,
} from '@dword-design/functions'
import proxyquire from '@dword-design/proxyquire'
import globby from 'globby'
import outputFiles from 'output-files'
import withLocalTmpDir from 'with-local-tmp-dir'

const runTest = config => {
  config = {
    commonAllowedMatches: [],
    configAllowedMatches: [],
    configFiles: [],
    files: {},
    gitignore: [],
    ...config,
  }
  return () => {
    const self = proxyquire('./clean', {
      './common-allowed-matches.json': config.commonAllowedMatches,
      './config': {
        allowedMatches: config.configAllowedMatches,
      },
      './config-files': zipObject(
        config.configFiles,
        config.configFiles |> map(stubString)
      ),
      './config-files/gitignore.config': config.gitignore,
    })
    return withLocalTmpDir(async () => {
      await outputFiles(config.files)
      await self()
      expect(
        globby('*', { onlyFiles: false })
          |> await
          |> keyBy(identity)
          |> mapValues(stubTrue)
      ).toEqual(config.result)
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
      'bar.txt': true,
    },
  },
  'config allowed matches': {
    configAllowedMatches: ['bar.txt'],
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    result: {
      'bar.txt': true,
    },
  },
  'config files': {
    configFiles: ['bar.txt'],
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    result: {
      'bar.txt': true,
    },
  },
  'config files: subpath': {
    configFiles: ['sub/foo.txt'],
    files: {
      'sub/foo.txt': '',
    },
    result: {
      sub: true,
    },
  },
  gitignore: {
    files: {
      'bar.txt': '',
      'foo.txt': '',
    },
    gitignore: ['/bar.txt'],
    result: {
      'bar.txt': true,
    },
  },
  valid: {
    files: {
      'foo.txt': '',
    },
    result: {},
  },
} |> mapValues(runTest)
