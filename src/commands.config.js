import P from 'path'
import { copyFile, remove, outputFile, readFile, symlink } from 'fs-extra'
import { spawn } from 'child-process-promise'
import projectzConfig from './projectz.config'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import { filter, join, values, promiseAll, mapValues, replace, map, sortBy, identity } from '@dword-design/functions'
import config from './config'
import gitignoreConfig from './gitignore.config'

const buildConfigFiles = async () => {
  console.log('Copying config files …')
  await outputFile('.gitignore', gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''))
  await copyFile(P.resolve(__dirname, 'config-files', 'editorconfig'), '.editorconfig')
  await copyFile(P.resolve(__dirname, 'config-files', 'gitpod.yml'), '.gitpod.yml')
  await copyFile(P.resolve(__dirname, 'config-files', 'LICENSE.md'), 'LICENSE.md')
  await copyFile(P.resolve(__dirname, 'config-files', 'renovaterc.json'), '.renovaterc.json')
  await copyFile(P.resolve(__dirname, 'config-files', 'travis.yml'), '.travis.yml')
  console.log('Updating README.md …')
  await outputFile('projectz.json', JSON.stringify(projectzConfig, undefined, 2))
  try {
    await spawn('projectz', ['compile'], { capture: ['stdout'] })
  } catch (error) {
    console.log(error.stdout)
    throw error
  } finally {
    await remove('projectz.json')
  }
}

export default {

  build: {
    handler: async () => {
      await buildConfigFiles()
      return config.build()
    },
  },
  start: {
    handler: () => config.start(),
  },
  test: {
    arguments: '[pattern]',
    handler: async pattern => {
      await config.lint()
      await spawn('ajv', ['-s', require.resolve('@dword-design/json-schema-package'), '-d', 'package.json', '--errors', 'text'], { stdio: 'inherit' })
      if (safeReadFileSync('.gitignore', 'utf8') !== (gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''))) {
        throw new Error('.gitignore file must be generated. Maybe it has been accidentally modified.')
      }
      if (safeReadFileSync('.gitpod.yml', 'utf8') !== await readFile(P.resolve(__dirname, 'config-files', 'gitpod.yml'), 'utf8')) {
        throw new Error('.gitpod.yml file must be generated. Maybe it has been accidentally modified.')
      }
      if (safeReadFileSync('.renovaterc.json', 'utf8') !== await readFile(P.resolve(__dirname, 'config-files', 'renovaterc.json'), 'utf8')) {
        throw new Error('.renovaterc.json file must be generated. Maybe it has been accidentally modified.')
      }
      if (safeReadFileSync('.travis.yml', 'utf8') !== await readFile(P.resolve(__dirname, 'config-files', 'travis.yml'), 'utf8')) {
        throw new Error('.travis.yml file must be generated. Maybe it has been accidentally modified.')
      }

      const readmeContent = safeReadFileSync('README.md', 'utf8') ?? ''
      const missingReadmeSections = ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE']
        |> filter(sectionName => !getProjectzReadmeSectionRegex(sectionName).test(readmeContent))
      if (missingReadmeSections.length > 0) {
        throw new Error(`The README.md file is missing or misses the following sections: ${missingReadmeSections |> join(', ')}`)
      }

      if (!getProjectzReadmeSectionRegex('LICENSEFILE').test(await readFile('LICENSE.md', 'utf8'))) {
        throw new Error('LICENSE.md file must be generated. Maybe it has been accidentally modified.')
      }
      await spawn('depcheck', ['--skip-missing', true, '--config', require.resolve('./depcheck.config'), '.'], { stdio: 'inherit' })

      const binEntries = require(P.resolve('package.json')).bin ?? {}
      await binEntries
        |> mapValues((filename, binName) => remove(P.join('node_modules', '.bin', binName))
          .then(() => symlink(
            P.relative(P.join('node_modules', '.bin'), filename |> replace('dist', 'src')),
            P.join('node_modules', '.bin', binName)
          ))
        )
        |> values
        |> promiseAll

      await spawn(
        'nyc',
        [
          '--reporter', 'lcov',
          '--reporter', 'text',
          '--cwd', process.cwd(),
          '--require', require.resolve('./pretest'),
          'mocha-per-file',
          ...pattern !== undefined ? [pattern] : [],
        ],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            BABEL_CACHE_PATH: P.join(process.cwd(), 'node_modules', '.cache', '@babel', 'register', '.babel.json'),
          },
        }
      )
    },
  },
}
