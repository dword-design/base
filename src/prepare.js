import outputFiles from 'output-files'
import { spawn } from 'child-process-promise'
import workspaceGlob from './workspace-glob'
import glob from 'glob-promise'
import gitignoreConfig from './gitignore.config'
import isWorkspaceRoot from '@dword-design/is-workspace-root'
import { copyFile, outputFile, readFile, remove, copy } from 'fs-extra'
import P from 'path'
import { join, map, sortBy, identity, jsonToString, filter, zipObject, keys, unary, ary } from '@dword-design/functions'
import getPackageString from './get-package-string'
import badges from './badges.config'
import withLocalTmpDir from 'with-local-tmp-dir'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import ignore from 'ignore'

export default async () => {

  const packageJsonString = await getPackageString()

  const markdownFiles = await withLocalTmpDir(async () => {
    await outputFile(
      'package.json',
      {
        name: 'base-project',
        repository: 'base/project',
        ...JSON.parse(packageJsonString),
        badges: {
          list: badges,
        },
      }
        |> jsonToString({ indent: 2 }),
    )
    await outputFile(
      'README.md',
      safeReadFileSync(P.join('..', 'README.md'), 'utf8')
        ?? (await readFile(P.resolve(__dirname, 'generated-files', 'README.md'))),
    )
    await copyFile(P.resolve(__dirname, 'generated-files', 'LICENSE.md'), 'LICENSE.md')
    try {
      await spawn('projectz', ['compile'], { capture: ['stdout'] })
      return {
        'LICENSE.md': await readFile('LICENSE.md', 'utf8'),
        'README.md': await readFile('README.md', 'utf8'),
      }
    } catch (error) {
      throw new Error(error.stdout)
    }
  })

  const copiedFilenames = isWorkspaceRoot
    ? await glob('*', { cwd: P.resolve(__dirname, 'copied-files') })
    : []
  const copiedFiles = zipObject(
    copiedFilenames |> map(filename => `.${filename}`),
    copiedFilenames |> map(filename => P.resolve(__dirname, 'copied-files', filename)),
  )

  const generatedFiles = {
    '.gitignore': gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''),
    'package.json': packageJsonString,
    ...markdownFiles,
  }

  glob('*', {
    dot: true,
    ignore: [
      ...{ ...copiedFiles, ...generatedFiles } |> keys,
      '.git',
      'packages',
      'src',
      'test',
      'yarn.lock',
    ],
  })
    |> await
    |> filter(ignore().add(gitignoreConfig).createFilter())
    |> map(unary(remove))
    |> Promise.all
    |> await

  copiedFiles
    |> map(ary(copy, 2))
    |> Promise.all
    |> await

  await outputFiles(generatedFiles)

  if (workspaceGlob !== undefined) {
    return spawn('wsrun', ['--stages', '--bin', require.resolve('./run-command.cli'), '-c', 'prepare'], { stdio: 'inherit' })
  }
}