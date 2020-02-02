import getNewFiles from './get-new-files'
import disparity from 'disparity'
import { mapValues, trimChars, values, compact, join, filter, omit } from '@dword-design/functions'
import { spawn } from 'child-process-promise'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'

export default async () => {

  try {
    await spawn(
      'ajv',
      [
        '-s', require.resolve('./package-json-schema.config'),
        '-d', 'package.json',
        '--errors', 'text',
      ],
      { capture: ['stderr'] },
    )
  } catch ({ stderr }) {
    throw new Error(stderr)
  }
  
  const readmeContent = safeReadFileSync('README.md', 'utf8') ?? ''
  const missingReadmeSections = ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE']
    |> filter(sectionName => !getProjectzReadmeSectionRegex(sectionName).test(readmeContent))
  if (missingReadmeSections.length > 0) {
    throw new Error(`The README.md file is missing or misses the following sections: ${missingReadmeSections |> join(', ')}`)
  }

  const output = getNewFiles()
    |> await
    |> omit('.editorconfig')
    |> mapValues((newContent, filename) =>
      disparity.unified(
        safeReadFileSync(filename, 'utf8') ?? '',
        newContent,
        { paths: [filename, filename] },
      )
        |> trimChars('\n'),
    )
    |> values
    |> compact
    |> join('\n')

  if (output !== '') {
    throw new Error(output)
  }
}